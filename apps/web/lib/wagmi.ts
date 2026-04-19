import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base } from 'wagmi/chains';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

// Module-scoped singleton — survives HMR and re-imports
const globalKey = '__shipwithai_wagmi_config__' as const;
const g = globalThis as unknown as Record<string, ReturnType<typeof getDefaultConfig>>;

export function getWagmiConfig() {
  if (!g[globalKey]) {
    g[globalKey] = getDefaultConfig({
      appName: 'ShipWithAI',
      projectId,
      chains: [base],
      ssr: true,
    });
  }
  return g[globalKey];
}

export const wagmiConfig = projectId ? getWagmiConfig() : null;
