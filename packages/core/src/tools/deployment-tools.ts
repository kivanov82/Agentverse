/**
 * Deployment Tools — Vercel integration for preview and production deploys.
 *
 * Tools: vercel_deploy_preview, vercel_deploy, vercel_configure, vercel_get_deployment
 *
 * Uses the Vercel REST API: https://vercel.com/docs/rest-api
 * Requires: VERCEL_TOKEN, VERCEL_TEAM_ID (optional)
 */

import type { ToolRegistry } from './index';
import type { ToolExecutionContext, ToolExecutionResult } from '../types';

const FRAMEWORK_ENUM = [
  'nextjs', 'vite', 'create-react-app', 'gatsby', 'nuxtjs',
  'svelte', 'astro', 'remix', 'hugo', 'eleventy', null,
] as const;

interface ProjectOptions {
  framework?: string;
  rootDirectory?: string;
  buildCommand?: string;
  installCommand?: string;
  outputDirectory?: string;
}

/** Shared deploy tool input properties (framework, rootDirectory, build settings). */
const DEPLOY_OPTION_PROPERTIES = {
  framework: {
    type: 'string',
    description: 'Framework (nextjs, vite, create-react-app, etc.). Auto-detected if omitted.',
    enum: FRAMEWORK_ENUM,
  },
  rootDirectory: {
    type: 'string',
    description: 'Root directory for monorepos (e.g. "packages/web"). Leave empty for single-app repos.',
  },
  buildCommand: { type: 'string', description: 'Custom build command. Defaults to "npm run build".' },
  installCommand: { type: 'string', description: 'Custom install command (e.g. "pnpm install").' },
  outputDirectory: { type: 'string', description: 'Build output directory (e.g. ".next", "dist", "build").' },
} as const;

/** Extract project options from raw tool input. */
function extractProjectOptions(input: Record<string, unknown>): ProjectOptions {
  const opts: ProjectOptions = {};
  if (input.framework) opts.framework = input.framework as string;
  if (input.rootDirectory) opts.rootDirectory = input.rootDirectory as string;
  if (input.buildCommand) opts.buildCommand = input.buildCommand as string;
  if (input.installCommand) opts.installCommand = input.installCommand as string;
  if (input.outputDirectory) opts.outputDirectory = input.outputDirectory as string;
  return opts;
}

/** Validate that the Vercel token and repo are available. Returns context or error. */
function requireVercelContext(context: ToolExecutionContext):
  | { projectName: string; repoFullName: string }
  | { error: ToolExecutionResult } {
  if (!process.env.VERCEL_TOKEN) {
    return {
      error: {
        content: 'VERCEL_TOKEN is not configured. Set the VERCEL_TOKEN environment variable to enable Vercel deployments.',
        isError: true,
        errorCategory: 'business' as const,
        isRetryable: false,
      },
    };
  }
  if (!context.repoFullName) {
    return {
      error: {
        content: 'No GitHub repository linked to this project. Create a repo first.',
        isError: true,
      },
    };
  }
  return {
    projectName: context.repoFullName.split('/')[1],
    repoFullName: context.repoFullName,
  };
}

function getVercelTeamId(): string | undefined {
  return process.env.VERCEL_TEAM_ID || undefined;
}

async function vercelFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = process.env.VERCEL_TOKEN;
  if (!token) throw new Error('VERCEL_TOKEN not configured');

  const teamId = getVercelTeamId();
  const separator = path.includes('?') ? '&' : '?';
  const url = `https://api.vercel.com${path}${teamId ? `${separator}teamId=${teamId}` : ''}`;

  return fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}

/**
 * Create a new Vercel project linked to a GitHub repo.
 */
async function createVercelProject(
  repoFullName: string,
  projectName: string,
  options: {
    framework?: string;
    rootDirectory?: string;
    buildCommand?: string;
    installCommand?: string;
    outputDirectory?: string;
  } = {}
): Promise<{ id: string; name: string; url: string }> {
  const framework = options.framework || 'nextjs';
  const outputDir = options.outputDirectory || (framework === 'nextjs' ? '.next' : 'dist');

  const body: Record<string, unknown> = {
    name: projectName,
    framework,
    gitRepository: {
      type: 'github',
      repo: repoFullName,
    },
    buildCommand: options.buildCommand || 'npm run build',
    outputDirectory: outputDir,
    installCommand: options.installCommand || 'npm install',
  };

  if (options.rootDirectory) {
    body.rootDirectory = options.rootDirectory;
  }

  const res = await vercelFetch('/v10/projects', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err: any = await res.json();
    throw new Error(`Failed to create Vercel project: ${err.error?.message || JSON.stringify(err)}`);
  }

  const project: any = await res.json();
  return {
    id: project.id,
    name: project.name,
    url: `https://${project.name}.vercel.app`,
  };
}

/**
 * Trigger a deployment for a branch.
 */
async function triggerDeployment(
  projectName: string,
  branch: string = 'main',
  isProduction: boolean = false
): Promise<{ id: string; url: string; readyState: string }> {
  // First get the project to find its ID
  const projectRes = await vercelFetch(`/v9/projects/${encodeURIComponent(projectName)}`);
  if (!projectRes.ok) {
    throw new Error(`Project "${projectName}" not found on Vercel`);
  }
  const project: any = await projectRes.json();

  // Get the linked repo info
  const repoFullName = project.link?.repo
    ? `${project.link.org || project.link.repoOwner}/${project.link.repo}`
    : null;

  if (!repoFullName) {
    throw new Error('Project is not linked to a GitHub repository');
  }

  const res = await vercelFetch('/v13/deployments', {
    method: 'POST',
    body: JSON.stringify({
      name: projectName,
      project: project.id,
      target: isProduction ? 'production' : undefined,
      gitSource: {
        type: 'github',
        ref: branch,
        repoId: String(project.link.repoId),
      },
    }),
  });

  if (!res.ok) {
    const err: any = await res.json();
    throw new Error(`Deployment failed: ${err.error?.message || JSON.stringify(err)}`);
  }

  const deployment: any = await res.json();
  return {
    id: deployment.id,
    url: `https://${deployment.url}`,
    readyState: deployment.readyState,
  };
}

/**
 * Get the latest deployment for a project/branch.
 */
async function getLatestDeployment(
  projectName: string,
  branch?: string
): Promise<{ id: string; url: string; state: string; createdAt: number } | null> {
  const params = new URLSearchParams({ projectId: projectName, limit: '1' });
  if (branch) params.set('target', branch === 'main' ? 'production' : 'preview');

  const res = await vercelFetch(`/v6/deployments?${params.toString()}`);
  if (!res.ok) return null;

  const data: any = await res.json();
  const dep = data.deployments?.[0];
  if (!dep) return null;

  return {
    id: dep.uid,
    url: `https://${dep.url}`,
    state: dep.readyState || dep.state,
    createdAt: dep.created,
  };
}

/**
 * Set environment variables on a Vercel project.
 */
async function setEnvVars(
  projectId: string,
  envVars: Record<string, string>,
  target: string[] = ['production', 'preview', 'development']
): Promise<void> {
  const vars = Object.entries(envVars).map(([key, value]) => ({
    key,
    value,
    target,
    type: 'encrypted',
  }));

  const res = await vercelFetch(`/v10/projects/${projectId}/env`, {
    method: 'POST',
    body: JSON.stringify(vars),
  });

  if (!res.ok) {
    const err: any = await res.json();
    throw new Error(`Failed to set env vars: ${err.error?.message || JSON.stringify(err)}`);
  }
}

/** Shared deploy-or-create handler used by both vercel_deploy and vercel_deploy_preview. */
async function handleDeploy(
  input: Record<string, unknown>,
  context: ToolExecutionContext,
  isProduction: boolean,
): Promise<ToolExecutionResult> {
  const ctx = requireVercelContext(context);
  if ('error' in ctx) return ctx.error;

  const branch = (input.branch as string) || (isProduction ? 'main' : '');
  const label = isProduction ? 'Production' : 'Preview';

  try {
    try {
      const deployment = await triggerDeployment(ctx.projectName, branch, isProduction);
      return {
        content: `${label} deployment triggered!\n\nURL: ${deployment.url}\nStatus: ${deployment.readyState}\nDeployment ID: ${deployment.id}\n\nCall vercel_get_deployment in ~60 seconds to verify the build succeeded.`,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('not found')) {
        const project = await createVercelProject(ctx.repoFullName, ctx.projectName, extractProjectOptions(input));
        return {
          content: `Vercel project created and linked to ${ctx.repoFullName}!\n\nProject: ${project.name}\n${label} URL: ${project.url}\n\nThe first deployment is building now. Call vercel_get_deployment in ~60 seconds to verify.`,
        };
      }
      throw err;
    }
  } catch (error) {
    return {
      content: `Vercel deployment error: ${error instanceof Error ? error.stack || error.message : String(error)}`,
      isError: true,
      errorCategory: 'transient' as const,
      isRetryable: true,
    };
  }
}

export function registerDeploymentTools(registry: ToolRegistry): void {
  // --- vercel_deploy_preview ---
  registry.register(
    {
      name: 'vercel_deploy_preview',
      description:
        'Trigger a preview deployment on Vercel for a branch. ' +
        'Creates the Vercel project automatically if it does not exist. ' +
        'Returns a preview URL for testing. ' +
        'For monorepos, set rootDirectory to the app folder (e.g. "packages/web").',
      input_schema: {
        type: 'object',
        properties: {
          branch: { type: 'string', description: 'Branch to deploy from' },
          ...DEPLOY_OPTION_PROPERTIES,
        },
        required: ['branch'],
      },
    },
    (input, context) => handleDeploy(input, context, false),
  );

  // --- vercel_deploy ---
  registry.register(
    {
      name: 'vercel_deploy',
      description:
        'Deploy to production on Vercel from the main branch. ' +
        'Creates the Vercel project automatically if it does not exist. ' +
        'For monorepos, set rootDirectory to the app folder (e.g. "packages/web").',
      input_schema: {
        type: 'object',
        properties: {
          branch: { type: 'string', description: 'Branch to deploy. Defaults to "main".' },
          ...DEPLOY_OPTION_PROPERTIES,
        },
      },
    },
    (input, context) => handleDeploy(input, context, true),
  );

  // --- vercel_configure ---
  registry.register(
    {
      name: 'vercel_configure',
      description:
        'Configure Vercel project settings: environment variables, custom domains, build settings, root directory.',
      input_schema: {
        type: 'object',
        properties: {
          envVars: {
            type: 'object',
            description: 'Environment variables to set (key-value pairs)',
          },
          domain: { type: 'string', description: 'Custom domain to add' },
          ...DEPLOY_OPTION_PROPERTIES,
        },
      },
    },
    async (input, context) => {
      const ctx = requireVercelContext(context);
      if ('error' in ctx) return ctx.error;

      try {
        // Build independent operations to run in parallel
        const ops: Promise<string>[] = [];

        // Set environment variables
        const envVars = input.envVars as Record<string, string> | undefined;
        if (envVars && Object.keys(envVars).length > 0) {
          ops.push(
            setEnvVars(ctx.projectName, envVars)
              .then(() => `Set ${Object.keys(envVars).length} environment variable(s): ${Object.keys(envVars).join(', ')}`)
              .catch((e) => `Env vars error: ${e instanceof Error ? e.message : String(e)}`)
          );
        }

        // Add custom domain
        const domain = input.domain as string | undefined;
        if (domain) {
          ops.push(
            vercelFetch(`/v10/projects/${ctx.projectName}/domains`, {
              method: 'POST',
              body: JSON.stringify({ name: domain }),
            }).then(async (res) => {
              if (res.ok) return `Added domain: ${domain}`;
              const err: any = await res.json();
              return `Domain error: ${err.error?.message || 'Failed to add domain'}`;
            })
          );
        }

        // Update project settings
        const projectUpdate = extractProjectOptions(input);
        if (Object.keys(projectUpdate).length > 0) {
          ops.push(
            vercelFetch(`/v9/projects/${ctx.projectName}`, {
              method: 'PATCH',
              body: JSON.stringify(projectUpdate),
            }).then(async (res) => {
              if (res.ok) return `Updated project settings: ${Object.keys(projectUpdate).join(', ')}`;
              const err: any = await res.json();
              return `Settings error: ${err.error?.message || 'Failed to update settings'}`;
            })
          );
        }

        if (ops.length === 0) {
          return { content: 'No configuration changes specified.' };
        }

        const results = await Promise.all(ops);
        return {
          content: `Vercel configuration updated:\n${results.map(r => `- ${r}`).join('\n')}`,
        };
      } catch (error) {
        return {
          content: `Configuration error: ${error instanceof Error ? error.message : String(error)}`,
          isError: true,
          errorCategory: 'transient' as const,
          isRetryable: true,
        };
      }
    }
  );

  // --- vercel_get_deployment ---
  registry.register(
    {
      name: 'vercel_get_deployment',
      description:
        'Check deployment status, waiting for the build to finish (up to 5 minutes). ' +
        'Returns the final status: READY with the live URL, or ERROR with build logs. ' +
        'Call this ONCE after triggering a deployment — it handles the waiting internally.',
      input_schema: {
        type: 'object',
        properties: {
          deploymentId: { type: 'string', description: 'Specific deployment ID to check. If omitted, checks the latest deployment.' },
        },
      },
    },
    async (input, context) => {
      const ctx = requireVercelContext(context);
      if ('error' in ctx) return ctx.error;

      const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      const MAX_POLLS = 6;
      const POLL_INTERVAL = 20_000; // 20 seconds (max 2 min total, safe for Cloud Run)
      const { projectName } = ctx;

      try {
        const deploymentId = input.deploymentId as string | undefined;

        async function fetchStatus(): Promise<{ id: string; url: string; state: string; createdAt: number } | null> {
          if (deploymentId) {
            const res = await vercelFetch(`/v13/deployments/${deploymentId}`);
            if (!res.ok) return null;
            const dep: any = await res.json();
            return {
              id: dep.id || dep.uid,
              url: `https://${dep.url}`,
              state: dep.readyState || dep.state,
              createdAt: dep.createdAt || dep.created,
            };
          } else {
            return getLatestDeployment(projectName);
          }
        }

        // Poll until build finishes or timeout
        let dep = await fetchStatus();
        if (!dep) {
          return { content: deploymentId ? `Deployment ${deploymentId} not found.` : 'No deployments found for this project.', isError: true };
        }

        let polls = 0;
        while (['BUILDING', 'INITIALIZING', 'QUEUED'].includes(dep.state) && polls < MAX_POLLS) {
          polls++;
          console.log(`[vercel_get_deployment] Build in progress (${dep.state}), waiting 30s... (poll ${polls}/${MAX_POLLS})`);
          await sleep(POLL_INTERVAL);
          const updated = await fetchStatus();
          if (updated) dep = updated;
        }

        const age = Math.round((Date.now() - dep.createdAt) / 60000);
        let result = `Deployment: ${dep.id}\nURL: ${dep.url}\nStatus: ${dep.state}\nAge: ${age} minutes ago`;

        if (dep.state === 'READY') {
          result += '\n\nDeployment is live and ready!';
        } else if (dep.state === 'ERROR' || dep.state === 'CANCELED') {
          // Fetch build error logs
          try {
            const eventsRes = await vercelFetch(`/v2/deployments/${dep.id}/events`);
            if (eventsRes.ok) {
              const events = (await eventsRes.json()) as any[];
              const errorLines = events
                .filter((ev: any) => {
                  const text = ev?.payload?.text || ev?.text || '';
                  return ev?.type === 'stderr' ||
                    text.toLowerCase().includes('error') ||
                    text.includes('Cannot find') ||
                    text.includes('Module not found') ||
                    text.includes('Failed to compile');
                })
                .map((ev: any) => ev?.payload?.text || ev?.text || '')
                .filter((t: string) => t.trim())
                .slice(-20);

              if (errorLines.length > 0) {
                const cleanLines = errorLines.map((l: string) => l.replace(/\u001b\[[0-9;]*m/g, ''));
                result += `\n\n## Build Errors\n\`\`\`\n${cleanLines.join('\n')}\n\`\`\``;
              }
            }
          } catch { /* non-fatal */ }
        } else {
          // Still building after max polls
          result += `\n\nBuild still in progress after ${polls * 30}s of waiting. Check the Vercel dashboard for updates.`;
        }

        return { content: result };
      } catch (error) {
        console.error('[vercel_get_deployment] Error:', error);
        return {
          content: `Error checking deployment: ${error instanceof Error ? error.message : String(error)}`,
          isError: true,
        };
      }
    }
  );
}
