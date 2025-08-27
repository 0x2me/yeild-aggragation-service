import { createConfig } from 'wagmi';
import { http } from 'viem';
import { mainnet, optimism, base, arbitrum, polygon } from 'viem/chains';

export const wagmiConfig = createConfig({
  chains: [mainnet, optimism, base, arbitrum, polygon],
  multiInjectedProviderDiscovery: false,
  transports: {
    [mainnet.id]: http(),
    [optimism.id]: http(),
    [base.id]: http(),
    [arbitrum.id]: http(),
    [polygon.id]: http(),
  },
});

export const dynamicEnvironmentId = import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID;

if (!dynamicEnvironmentId) {
  throw new Error(
    'VITE_DYNAMIC_ENVIRONMENT_ID is not set. Please add it to your .env file. ' +
    'Get your environment ID from https://app.dynamic.xyz/'
  );
}