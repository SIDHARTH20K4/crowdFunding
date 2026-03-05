import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { polygonAmoy } from 'wagmi/chains';

export const WagmiConfig = getDefaultConfig({
    appName: 'LigerGames',
    projectId: '1cc1e96486a549f456accfbadfa9ad16', // Get from https://cloud.walletconnect.com/
    chains: [polygonAmoy], // Add more chains like `polygon`, `optimism`
});