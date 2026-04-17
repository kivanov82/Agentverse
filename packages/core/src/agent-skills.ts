/**
 * Agent Skills Loader
 *
 * Reads `agents/{agentId}/skills/*\/SKILL.md` files and returns a single
 * markdown block ready to append to an agent's system prompt.
 *
 * Each SKILL.md must start with YAML frontmatter:
 *   ---
 *   name: skill-name
 *   description: One-line description
 *   ---
 *
 * Order: alphabetical by skill folder name (stable).
 * If the agent's config.json declares a `skills: string[]` allowlist, only
 * those skill folders are loaded.
 */

import * as fs from 'fs';
import * as path from 'path';

export interface LoadedSkill {
  folder: string;                // skills/<folder>/
  name: string;                  // from frontmatter
  description?: string;          // from frontmatter
  body: string;                  // SKILL.md content with frontmatter stripped
}

export interface LoadSkillsOptions {
  /** Optional allowlist of skill folder names. If provided, only these load. */
  allowlist?: string[];
}

/**
 * Parse a SKILL.md file.
 * Returns null if the file lacks valid YAML frontmatter.
 */
function parseSkillFile(absPath: string, folder: string): LoadedSkill | null {
  let raw: string;
  try {
    raw = fs.readFileSync(absPath, 'utf-8');
  } catch {
    return null;
  }

  // Very small frontmatter parser: expects file to start with "---\n"
  if (!raw.startsWith('---')) return null;
  const end = raw.indexOf('\n---', 3);
  if (end < 0) return null;

  const frontmatterBlock = raw.slice(3, end).trim();
  const body = raw.slice(end + 4).replace(/^\n+/, '');

  const frontmatter: Record<string, string> = {};
  for (const line of frontmatterBlock.split('\n')) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_-]*):\s*(.*)$/);
    if (match) {
      frontmatter[match[1]] = match[2].trim();
    }
  }

  if (!frontmatter.name) return null;

  return {
    folder,
    name: frontmatter.name,
    description: frontmatter.description,
    body,
  };
}

/**
 * Load all SKILL.md files for an agent.
 *
 * @param agentsDir Absolute path to the `agents/` directory
 * @param agentId   Agent folder name (e.g. `solidity-auditor`)
 */
export function loadAgentSkills(
  agentsDir: string,
  agentId: string,
  options: LoadSkillsOptions = {}
): LoadedSkill[] {
  const skillsRoot = path.join(agentsDir, agentId, 'skills');
  if (!fs.existsSync(skillsRoot)) return [];

  const entries = fs.readdirSync(skillsRoot, { withFileTypes: true });
  const folders = entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();

  const filtered = options.allowlist
    ? folders.filter((f) => options.allowlist!.includes(f))
    : folders;

  const skills: LoadedSkill[] = [];
  for (const folder of filtered) {
    const skillPath = path.join(skillsRoot, folder, 'SKILL.md');
    const parsed = parseSkillFile(skillPath, folder);
    if (parsed) skills.push(parsed);
  }

  return skills;
}

/**
 * Render loaded skills into a single markdown block suitable for appending
 * to a system prompt. Returns '' when there are no skills.
 */
export function renderSkillsBlock(skills: LoadedSkill[]): string {
  if (skills.length === 0) return '';

  const sections = skills.map((skill) => {
    const descLine = skill.description ? `\n> ${skill.description}\n` : '';
    return `---\n\n## Skill: ${skill.name}${descLine}\n${skill.body.trim()}\n`;
  });

  return `\n\n# Agent Skills\n\nThe following skills are available. Follow their instructions when the user's request matches.\n\n${sections.join('\n')}`;
}
