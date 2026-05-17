import { NextRequest, NextResponse } from 'next/server';
import * as path from 'path';
import * as fs from 'fs';
import { loadAgentSkills } from '@shipwithai/core/agent-skills';

// GET /api/agents/:agentId/skills — lists all skills declared for an agent,
// with fixed price (if any). Used by the intake wizard to render bundle
// options with accurate prices without hardcoding them on the client.
export async function GET(
  _request: NextRequest,
  { params }: { params: { agentId: string } },
) {
  const { agentId } = params;
  const agentsDir = path.join(process.cwd(), '..', '..', 'agents');
  const configPath = path.join(agentsDir, agentId, 'config.json');
  if (!fs.existsSync(configPath)) {
    return NextResponse.json({ error: `Agent ${agentId} not found` }, { status: 404 });
  }

  // Respect the same skills allowlist the invoke route uses.
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const allowlist = Array.isArray(config.skills) ? (config.skills as string[]) : undefined;

  const skills = loadAgentSkills(agentsDir, agentId, { allowlist }).map((s) => ({
    id: s.folder,
    name: s.name,
    description: s.description,
    priceUsd: s.priceUsd,
  }));

  return NextResponse.json({ success: true, skills });
}
