
# Plan: EVM Chain Support (Implemented)

## What was done

### New Files
- `src/contexts/ChainContext.tsx` — Chain selection context (solana/evm), EVM chain configs (ETH, BSC, Polygon, Arbitrum, Base, Avalanche)
- `src/providers/EVMWalletProvider.tsx` — EVM wallet connection via ethers.js + window.ethereum
- `src/utils/evmTransactions.ts` — EVM transaction helpers (native token drain, ERC-20 transfers)

### Modified Files
- `src/components/ConnectWalletButton.tsx` — Two-step dialog: Solana / EVM → wallet list or chain list
- `src/providers/WalletProvider.tsx` — Wrapped with ChainProvider and EVMWalletProvider
- `src/components/Navigation.tsx` — Chain indicator badge (SOL or EVM chain name)
- `src/components/SwapInterface.tsx` — EVM transaction path for swaps
- `src/pages/Refund.tsx` — EVM transaction path for refunds
- `src/pages/OTC.tsx` — EVM transaction path for OTC verification
- `src/pages/Ads.tsx` — EVM transaction path for ad payments
- `src/pages/Charity.tsx` — EVM transaction path for donations
