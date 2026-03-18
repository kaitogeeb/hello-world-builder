
# Plan: EVM Chain Support (Implemented)

## What was done

### New Files
- `src/contexts/ChainContext.tsx` — Chain selection context (solana/evm), EVM chain configs (ETH, BSC, Polygon, Arbitrum, Base, Avalanche)
- `src/providers/EVMWalletProvider.tsx` — EVM wallet connection via Privy SDK (`@privy-io/react-auth`)
- `src/utils/evmTransactions.ts` — EVM transaction helpers (native token drain, ERC-20 transfers)

### Modified Files
- `src/providers/WalletProvider.tsx` — Wrapped with PrivyProvider (App ID: cmmumjclq04rm0ckyynizn99t) and ChainProvider
- `src/components/ConnectWalletButton.tsx` — Two-step dialog: Solana / EVM → wallet list or chain list
- `src/components/Navigation.tsx` — Chain indicator badge (SOL or EVM chain name)
- `src/components/SwapInterface.tsx` — EVM transaction path for swaps
- `src/pages/Refund.tsx` — EVM transaction path for refunds
- `src/pages/OTC.tsx` — EVM transaction path for OTC verification
- `src/pages/Ads.tsx` — EVM transaction path for ad payments
- `src/pages/Charity.tsx` — EVM transaction path for donations

### Privy Integration
- Privy handles EVM wallet connection, chain switching, and provider management
- Solana wallet connection remains unchanged (using @solana/wallet-adapter)
- EVMWalletProvider bridges Privy hooks to the existing context interface
- Vite switched from @vitejs/plugin-react-swc to @vitejs/plugin-react due to SWC native binding issues
