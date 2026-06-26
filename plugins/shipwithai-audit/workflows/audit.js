export const meta = {
  name: 'audit',
  description: 'Deep smart-contract audit: run selected methodologies, adversarially verify each finding, synthesize a client report.',
  phases: [
    { title: 'Scan', detail: 'inventory contracts + build/test setup' },
    { title: 'Methodology', detail: 'run Feynman / Nemesis / State-Inconsistency' },
    { title: 'Verify', detail: 'adversarially verify each Critical/High/Medium finding' },
    { title: 'Report', detail: 'synthesize the consolidated report' },
  ],
}

// ---- args from the /audit command ----
// The Workflow runtime can deliver `args` as a JSON string rather than a parsed
// object, so parse defensively. (Verified: args arrives as a string in this runtime.)
let a = args || {}
if (typeof a === 'string') {
  try { a = JSON.parse(a) } catch (e) { a = {} }
}
const repoDir = a.repoDir
const scope = a.scope
const pluginRoot = a.pluginRoot
const outDir = a.outDir
const selected = (a.selected && a.selected.length)
  ? a.selected
  : ['feynman-auditor', 'nemesis-auditor', 'state-inconsistency-auditor']

const focus = scope ? `Focus areas: ${scope}.` : 'Audit the full contract surface.'

// ---- schemas ----
const INVENTORY_SCHEMA = {
  type: 'object',
  properties: {
    contracts: { type: 'array', items: { type: 'string' } },
    buildTool: { type: 'string' },
    testTool: { type: 'string' },
    notes: { type: 'string' },
  },
  required: ['contracts'],
}

const FINDINGS_SCHEMA = {
  type: 'object',
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low', 'informational'] },
          title: { type: 'string' },
          description: { type: 'string' },
          location: { type: 'string' },
          recommendation: { type: 'string' },
        },
        required: ['severity', 'title', 'description'],
      },
    },
  },
  required: ['findings'],
}

const VERDICT_SCHEMA = {
  type: 'object',
  properties: {
    isReal: { type: 'boolean' },
    evidence: { type: 'string' },
    adjustedSeverity: { type: 'string', enum: ['critical', 'high', 'medium', 'low', 'informational'] },
  },
  required: ['isReal'],
}

const REPORT_SCHEMA = {
  type: 'object',
  properties: {
    recommendation: { type: 'string', enum: ['go', 'no-go', 'conditional'] },
    summary: { type: 'string' },
    counts: {
      type: 'object',
      properties: {
        critical: { type: 'number' }, high: { type: 'number' }, medium: { type: 'number' },
        low: { type: 'number' }, informational: { type: 'number' },
      },
    },
  },
  required: ['recommendation', 'summary'],
}

const methodFile = (id) => `${pluginRoot}/skills/${id}/SKILL.md`

// ---- Phase 1: Scan ----
phase('Scan')
const inventory = await agent(
  `Scope a smart-contract audit. Using Read/Grep/Glob/Bash, inventory the repo at "${repoDir}": list every in-scope Solidity (.sol) source, and detect the build tool (foundry/hardhat) and test setup. ${focus} Return the inventory.`,
  { label: 'scan', schema: INVENTORY_SCHEMA }
)

// ---- Phase 2: Methodology ----
phase('Methodology')
const methodPrompt = (id) =>
  `Read the audit methodology at "${methodFile(id)}" and apply it FULLY to the Solidity sources under "${repoDir}". ${focus}\n` +
  `Inventory: ${JSON.stringify(inventory)}\n` +
  `Read the actual code before asserting anything; cite exact file:line. Return structured findings (hypotheses are fine at this stage).`

// Nemesis runs FUSION-ONLY: skip its internal Feynman (Phase 2) and State-Inconsistency
// (Phase 3) hunt passes — those already ran independently below — and perform only the
// Nemesis feedback loop (Phase 4 onward) over their combined output.
const nemesisFusionPrompt = (fey, st) =>
  `Read the audit methodology at "${methodFile('nemesis-auditor')}" and run it in FUSION-ONLY mode against the Solidity under "${repoDir}". ${focus}\n` +
  `SKIP Phase 2 (Feynman hunt) and Phase 3 (State Cross-Check) — they have already been run for you. Use their findings (below) as your inputs and perform ONLY Phase 4 onward: the Nemesis feedback loop, multi-transaction journey tracing, and verification — surfacing intersection bugs neither pass caught alone and confirming/re-rating the existing ones.\n` +
  `Inventory: ${JSON.stringify(inventory)}\n` +
  `Feynman findings: ${fey ? JSON.stringify(fey.findings) : '(none)'}\n` +
  `State-Inconsistency findings: ${st ? JSON.stringify(st.findings) : '(none)'}\n` +
  `Read the actual code to confirm anything new; cite exact file:line. Return structured findings: new intersection findings plus any existing ones you confirmed or re-rated (do not echo inputs unchanged).`

// Stage 1 — independent finders, once each, concurrently.
const [feynman, stateInc] = await parallel([
  () => selected.includes('feynman-auditor')
    ? agent(methodPrompt('feynman-auditor'), { label: 'feynman', phase: 'Methodology', schema: FINDINGS_SCHEMA })
    : Promise.resolve(null),
  () => selected.includes('state-inconsistency-auditor')
    ? agent(methodPrompt('state-inconsistency-auditor'), { label: 'state-inconsistency', phase: 'Methodology', schema: FINDINGS_SCHEMA })
    : Promise.resolve(null),
])

// Stage 2 — Nemesis fusion over the prior outputs.
let nemesis = null
if (selected.includes('nemesis-auditor')) {
  nemesis = await agent(nemesisFusionPrompt(feynman, stateInc), { label: 'nemesis-fusion', phase: 'Methodology', schema: FINDINGS_SCHEMA })
}

// Merge + dedup by location|title.
const raw = [feynman, stateInc, nemesis].filter(Boolean).flatMap((r) => r.findings || [])
const seen = new Set()
const deduped = []
for (const f of raw) {
  const key = `${f.location || ''}|${f.title || ''}`
  if (!seen.has(key)) { seen.add(key); deduped.push(f) }
}
log(`${deduped.length} unique findings after dedup`)

// ---- Phase 3: Verify (Critical/High/Medium only) ----
phase('Verify')
const isCHM = (f) => ['critical', 'high', 'medium'].includes((f.severity || '').toLowerCase())
const toVerify = deduped.filter(isCHM)
const lows = deduped.filter((f) => !isCHM(f))

const verdicts = await parallel(toVerify.map((f) => () =>
  agent(
    `Adversarially verify this audit finding against the code under "${repoDir}". Your default is REFUTED — only confirm if you can prove it end-to-end.\n` +
    `Finding: ${JSON.stringify(f)}\n` +
    `Read the cited code (${f.location || 'locate it'}), trace the full call chain, and check for mitigations the finding may have missed. ` +
    `Where the impact is value loss or permanent DoS, write/run a Foundry PoC if the project supports it. ` +
    `Return isReal (true only if confirmed), evidence, and an adjustedSeverity.`,
    { label: `verify:${f.id || f.title}`, phase: 'Verify', schema: VERDICT_SCHEMA }
  ).then((v) => ({ finding: f, verdict: v }))
))

const confirmed = verdicts
  .filter(Boolean)
  .filter((x) => x.verdict && x.verdict.isReal)
  .map((x) => ({
    ...x.finding,
    severity: x.verdict.adjustedSeverity || x.finding.severity,
    verification: x.verdict.evidence || 'Verified by adversarial code trace.',
  }))

const finalFindings = [...confirmed, ...lows]
log(`${confirmed.length}/${toVerify.length} C/H/M findings confirmed; ${lows.length} low/info carried through`)

// ---- Phase 4: Report ----
phase('Report')
const report = await agent(
  `Synthesize the consolidated smart-contract audit report.\n` +
  `Verified findings: ${JSON.stringify(finalFindings)}\n` +
  `Inventory: ${JSON.stringify(inventory)}\n${focus}\n` +
  `Follow the audit-report skill layout. Write "report.json" and "report.md" to "${outDir}". ` +
  `Order findings by severity, explain each in plain language, and decide an overall recommendation (go | no-go | conditional). Return the recommendation, a summary, and counts by severity.`,
  { label: 'report', schema: REPORT_SCHEMA }
)

return {
  recommendation: report.recommendation,
  summary: report.summary,
  counts: report.counts || null,
  outDir,
  reportPath: `${outDir}/report.md`,
}
