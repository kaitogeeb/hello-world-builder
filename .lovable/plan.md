

# Plan: Replace EVM Wallet Connection with Privy

## Overview

Replace the current raw `ethers.js` + `window.ethereum` EVM wallet connection with **Privy** (`@privy-io/react-auth`). Solana stays exactly as-is. Privy will handle EVM wallet connection, chain switching, and provide the ethers signer for transactions.

**Privy App ID:** `cmmumjclq04rm0ckyynizn99t` (public key, safe to store in code)

## Changes

### 1. Install dependency
- Add `@privy-io/react-auth` package

### 2. Update `src/providers/WalletProvider.tsx`
- Wrap the app with Privy's `PrivyProvider` configured with:
  - `appId: 'cmmumjclq04rm0ckyynizn99t'`
  - Supported chains: Ethereum, BSC, Polygon, Arbitrum, Base, Avalanche
  - Login methods: `['wallet']` (EVM wallets only, since Solana is handled separately)
- Keep existing Solana providers unchanged

### 3. Rewrite `src/providers/EVMWalletProvider.tsx`
- Replace raw `window.ethereum` logic with Privy hooks:
  - `usePrivy()` for connection state, `login()`, `logout()`
  - `useWallets()` to get the connected EVM wallet
  - Get ethers provider/signer from Privy's embedded wallet via `wallet.getEthersProvider()`
- Keep the same `EVMWalletContext` interface so all consuming components remain unchanged
- Use Privy's `wallet.switchChain()` instead of manual `wallet_switchEthereumChain` calls

### 4. Update `src/components/ConnectWalletButton.tsx`
- When user selects EVM → chain, call Privy's `login()` instead of raw `window.ethereum` connection
- After login, use Privy wallet to switch to selected chain
- Rest of the UI (two-step dialog, Solana flow) stays the same

### 5. No changes needed to transaction pages
- `SwapInterface.tsx`, `Charity.tsx`, `Refund.tsx`, `OTC.tsx`, `Ads.tsx` all consume `useEVMWallet()` which returns `evmSigner` — since we keep the same interface, these files need zero changes
- `evmTransactions.ts` utility stays the same (it takes an ethers signer)

## Technical Details

- Privy App ID is a publishable key — stored directly in code, no secrets needed
- The JWKS endpoint is for backend JWT verification — not needed for frontend
- Privy supports all major EVM wallets (MetaMask, Coinbase, WalletConnect, etc.) out of the box
- Chain configs in `ChainContext.tsx` remain unchanged

## File Summary

| File | Action |
|------|--------|
| `package.json` | Add `@privy-io/react-auth` |
| `src/providers/WalletProvider.tsx` | Wrap with `PrivyProvider` |
| `src/providers/EVMWalletProvider.tsx` | Rewrite internals to use Privy hooks |
| `src/components/ConnectWalletButton.tsx` | Use Privy login for EVM path |
| All other files | No changes |

