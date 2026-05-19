import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

initializeApp({
  credential: cert(JSON.parse(fs.readFileSync('/Users/kirilivanov/DEV/agent-verse/firebase-sa-key.json', 'utf8'))),
});
const db = getFirestore();

console.log('=== PROJECTS ===');
const projs = (await db.collection('projects').get()).docs.map((d) => d.data());
for (const p of projs) {
  console.log(`\n${p.name}  (id: ${p.id})`);
  console.log(`  status:      ${p.status}`);
  console.log(`  userId:      ${p.userId ?? '<none>'}`);
  console.log(`  useCaseId:   ${p.metadata?.useCaseId}`);
  console.log(`  createdAt:   ${new Date(p.createdAt).toISOString()}`);
  console.log(`  updatedAt:   ${new Date(p.updatedAt).toISOString()}`);
  console.log(`  description: ${(p.description ?? '').slice(0, 200)}`);
}

console.log('\n\n=== SESSIONS ===');
const sessions = (await db.collection('sessions').get()).docs.map((d) => ({ ...d.data(), _id: d.id }));
for (const s of sessions) {
  console.log(`\n${s.name}  (id: ${s._id})`);
  console.log(`  projectId:       ${s.projectId}`);
  console.log(`  status:          ${s.status}`);
  console.log(`  involvedAgents:  ${JSON.stringify(s.involvedAgents)}`);
  console.log(`  createdAt:       ${new Date(s.createdAt).toISOString()}`);
  console.log(`  updatedAt:       ${new Date(s.updatedAt).toISOString()}`);

  // Count messages in subcollection
  const msgSnap = await db.collection('sessions').doc(s._id).collection('messages').get();
  console.log(`  messages (sub):  ${msgSnap.size}`);

  // Show last 3
  const msgs = msgSnap.docs
    .map((d) => d.data())
    .sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0));
  const tail = msgs.slice(-3);
  for (const m of tail) {
    const content = (m.content ?? '').slice(0, 120).replace(/\s+/g, ' ');
    console.log(`    [${m.role}${m.agentId ? '/' + m.agentId : ''}] ${content}`);
  }
}

console.log('\n\n=== DELIVERABLES ===');
const delivs = (await db.collection('deliverables').get()).docs.map((d) => d.data());
for (const d of delivs) {
  console.log(`  ${d.title}  proj=${d.projectId}  agent=${d.agentId}`);
}

console.log('\n\n=== USAGE / COSTS ===');
for (const coll of ['invocationCosts', 'usageEvents']) {
  const snap = await db.collection(coll).get();
  console.log(`  ${coll}: ${snap.size} docs`);
  for (const d of snap.docs.slice(0, 3)) {
    const v = d.data();
    console.log(`    userId=${v.userId}  agent=${v.agentId}  apiCost=${v.apiCost}  userCharge=${v.userCharge}`);
  }
}

console.log('\n\n=== CREDIT LEDGER ===');
const ledger = (await db.collection('creditLedger').get()).docs.map((d) => d.data());
for (const e of ledger.sort((a, b) => b.createdAt - a.createdAt).slice(0, 5)) {
  console.log(`  userId=${e.userId}  delta=$${e.delta}  source=${e.source}  balanceAfter=$${e.balanceAfter}  ${new Date(e.createdAt).toISOString()}`);
}

process.exit(0);
