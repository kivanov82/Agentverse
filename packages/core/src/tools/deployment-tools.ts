/**
 * Deployment Tools — Vercel integration for preview and production deploys.
 *
 * Tools: vercel_deploy_preview, vercel_deploy, vercel_configure, vercel_get_preview
 *
 * Uses the Vercel REST API: https://vercel.com/docs/rest-api
 * Requires: VERCEL_TOKEN, VERCEL_TEAM_ID (optional)
 */

import type { ToolRegistry } from './index';

function getVercelToken(): string | null {
  return process.env.VERCEL_TOKEN || null;
}

function getVercelTeamId(): string | undefined {
  return process.env.VERCEL_TEAM_ID || undefined;
}

async function vercelFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getVercelToken();
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
  framework: string = 'nextjs'
): Promise<{ id: string; name: string; url: string }> {
  const [owner, repo] = repoFullName.split('/');

  const res = await vercelFetch('/v10/projects', {
    method: 'POST',
    body: JSON.stringify({
      name: projectName,
      framework,
      gitRepository: {
        type: 'github',
        repo: repoFullName,
      },
      buildCommand: 'npm run build',
      outputDirectory: '.next',
      installCommand: 'npm install',
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Failed to create Vercel project: ${err.error?.message || JSON.stringify(err)}`);
  }

  const project = await res.json();
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
  const project = await projectRes.json();

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
    const err = await res.json();
    throw new Error(`Deployment failed: ${err.error?.message || JSON.stringify(err)}`);
  }

  const deployment = await res.json();
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

  const data = await res.json();
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
    const err = await res.json();
    throw new Error(`Failed to set env vars: ${err.error?.message || JSON.stringify(err)}`);
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
        'Returns a preview URL for testing.',
      input_schema: {
        type: 'object',
        properties: {
          branch: { type: 'string', description: 'Branch to deploy from' },
        },
        required: ['branch'],
      },
    },
    async (input, context) => {
      const token = getVercelToken();
      if (!token) {
        return {
          content: 'VERCEL_TOKEN is not configured. Set the VERCEL_TOKEN environment variable to enable Vercel deployments.',
          isError: true,
          errorCategory: 'business' as const,
          isRetryable: false,
        };
      }

      const branch = input.branch as string;
      const repoFullName = context.repoFullName;

      if (!repoFullName) {
        return {
          content: 'No GitHub repository linked to this project. Create a repo first.',
          isError: true,
        };
      }

      try {
        // Derive project name from repo
        const projectName = repoFullName.split('/')[1];

        // Try to deploy — if project doesn't exist, create it first
        try {
          const deployment = await triggerDeployment(projectName, branch, false);
          return {
            content: `Preview deployment triggered!\n\nURL: ${deployment.url}\nStatus: ${deployment.readyState}\n\nThe preview will be ready in 1-2 minutes.`,
          };
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          if (msg.includes('not found')) {
            // Auto-create the project
            const project = await createVercelProject(repoFullName, projectName);
            return {
              content: `Vercel project created and linked to ${repoFullName}!\n\nProject: ${project.name}\nURL: ${project.url}\n\nVercel will automatically deploy when code is pushed. The first deployment is building now.`,
            };
          }
          throw err;
        }
      } catch (error) {
        return {
          content: `Vercel deployment error: ${error instanceof Error ? error.stack || error.message : String(error)}`,
          isError: true,
        };
      }
    }
  );

  // --- vercel_deploy ---
  registry.register(
    {
      name: 'vercel_deploy',
      description:
        'Deploy to production on Vercel from the main branch. ' +
        'Creates the Vercel project automatically if it does not exist.',
      input_schema: {
        type: 'object',
        properties: {
          branch: { type: 'string', description: 'Branch to deploy. Defaults to "main".' },
        },
      },
    },
    async (input, context) => {
      const token = getVercelToken();
      if (!token) {
        return {
          content: 'VERCEL_TOKEN is not configured. Set the VERCEL_TOKEN environment variable to enable Vercel deployments.',
          isError: true,
          errorCategory: 'business' as const,
          isRetryable: false,
        };
      }

      const branch = (input.branch as string) || 'main';
      const repoFullName = context.repoFullName;

      if (!repoFullName) {
        return {
          content: 'No GitHub repository linked to this project. Create a repo first.',
          isError: true,
        };
      }

      try {
        const projectName = repoFullName.split('/')[1];

        try {
          const deployment = await triggerDeployment(projectName, branch, true);
          return {
            content: `Production deployment triggered!\n\nURL: ${deployment.url}\nStatus: ${deployment.readyState}\n\nThe deployment will be live in 1-2 minutes.`,
          };
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          if (msg.includes('not found')) {
            const project = await createVercelProject(repoFullName, projectName);
            return {
              content: `Vercel project created and linked to ${repoFullName}!\n\nProject: ${project.name}\nProduction URL: ${project.url}\n\nThe first production deployment is building now.`,
            };
          }
          throw err;
        }
      } catch (error) {
        return {
          content: `Vercel deployment error: ${error instanceof Error ? error.stack || error.message : String(error)}`,
          isError: true,
        };
      }
    }
  );

  // --- vercel_configure ---
  registry.register(
    {
      name: 'vercel_configure',
      description:
        'Configure Vercel project settings: environment variables, custom domains, build settings.',
      input_schema: {
        type: 'object',
        properties: {
          envVars: {
            type: 'object',
            description: 'Environment variables to set (key-value pairs)',
          },
          domain: { type: 'string', description: 'Custom domain to add' },
          buildCommand: { type: 'string', description: 'Custom build command' },
        },
      },
    },
    async (input, context) => {
      const token = getVercelToken();
      if (!token) {
        return {
          content: 'VERCEL_TOKEN is not configured. Set the VERCEL_TOKEN environment variable to enable Vercel deployments.',
          isError: true,
          errorCategory: 'business' as const,
          isRetryable: false,
        };
      }

      const repoFullName = context.repoFullName;
      if (!repoFullName) {
        return { content: 'No GitHub repository linked.', isError: true };
      }

      const projectName = repoFullName.split('/')[1];
      const results: string[] = [];

      try {
        // Set environment variables
        const envVars = input.envVars as Record<string, string> | undefined;
        if (envVars && Object.keys(envVars).length > 0) {
          await setEnvVars(projectName, envVars);
          results.push(`Set ${Object.keys(envVars).length} environment variable(s): ${Object.keys(envVars).join(', ')}`);
        }

        // Add custom domain
        const domain = input.domain as string | undefined;
        if (domain) {
          const res = await vercelFetch(`/v10/projects/${projectName}/domains`, {
            method: 'POST',
            body: JSON.stringify({ name: domain }),
          });
          if (res.ok) {
            results.push(`Added domain: ${domain}`);
          } else {
            const err = await res.json();
            results.push(`Domain error: ${err.error?.message || 'Failed to add domain'}`);
          }
        }

        // Update build settings
        const buildCommand = input.buildCommand as string | undefined;
        if (buildCommand) {
          const res = await vercelFetch(`/v9/projects/${projectName}`, {
            method: 'PATCH',
            body: JSON.stringify({ buildCommand }),
          });
          if (res.ok) {
            results.push(`Updated build command: ${buildCommand}`);
          }
        }

        return {
          content: results.length > 0
            ? `Vercel configuration updated:\n${results.map(r => `- ${r}`).join('\n')}`
            : 'No configuration changes specified.',
        };
      } catch (error) {
        return {
          content: `Configuration error: ${error instanceof Error ? error.message : String(error)}`,
          isError: true,
        };
      }
    }
  );

  // --- vercel_get_deployment ---
  registry.register(
    {
      name: 'vercel_get_deployment',
      description:
        'Check the latest deployment status. If the build failed, returns the build error logs. ' +
        'ALWAYS call this after triggering a deployment to verify it succeeded.',
      input_schema: {
        type: 'object',
        properties: {
          deploymentId: { type: 'string', description: 'Specific deployment ID to check. If omitted, checks the latest deployment.' },
        },
      },
    },
    async (input, context) => {
      const token = getVercelToken();
      if (!token) {
        return {
          content: 'VERCEL_TOKEN is not configured.',
          isError: true,
          errorCategory: 'business' as const,
          isRetryable: false,
        };
      }

      const repoFullName = context.repoFullName;
      if (!repoFullName) {
        return { content: 'No GitHub repository linked.', isError: true };
      }

      try {
        const projectName = repoFullName.split('/')[1];
        const deploymentId = input.deploymentId as string | undefined;

        let depId: string;
        let depUrl: string;
        let depState: string;
        let depCreatedAt: number;

        if (deploymentId) {
          // Get specific deployment
          const res = await vercelFetch(`/v13/deployments/${deploymentId}`);
          if (!res.ok) {
            return { content: `Deployment ${deploymentId} not found.`, isError: true };
          }
          const dep = await res.json();
          depId = dep.id || dep.uid;
          depUrl = `https://${dep.url}`;
          depState = dep.readyState || dep.state;
          depCreatedAt = dep.createdAt || dep.created;
        } else {
          // Get latest deployment
          const deployment = await getLatestDeployment(projectName);
          if (!deployment) {
            return { content: 'No deployments found for this project.' };
          }
          depId = deployment.id;
          depUrl = deployment.url;
          depState = deployment.state;
          depCreatedAt = deployment.createdAt;
        }

        const age = Math.round((Date.now() - depCreatedAt) / 60000);
        let result = `Deployment: ${depId}\nURL: ${depUrl}\nStatus: ${depState}\nAge: ${age} minutes ago`;

        // If build failed, fetch and include build error logs
        if (depState === 'ERROR' || depState === 'CANCELED') {
          try {
            const eventsRes = await vercelFetch(`/v2/deployments/${depId}/events`);
            if (eventsRes.ok) {
              const events: any[] = await eventsRes.json();

              // Extract error lines from build output
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
                .slice(-15); // Last 15 error lines

              if (errorLines.length > 0) {
                // Strip ANSI escape codes
                const cleanLines = errorLines.map((l: string) => l.replace(/\u001b\[[0-9;]*m/g, ''));
                result += `\n\n## Build Errors\n\`\`\`\n${cleanLines.join('\n')}\n\`\`\``;
              }
            }
          } catch { /* non-fatal — just skip logs */ }
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
