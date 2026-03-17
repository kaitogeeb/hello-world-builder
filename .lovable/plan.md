

# Add EVM Chain Support via Chain Selector on Connect Wallet

## Overview

When the user clicks "Connect Wallet", a first-step dialog appears with two buttons: **Solana** and **EVM**. Choosing Solana proceeds with the existing flow. Choosing EVM shows a chain selector (Ethereum, BSC, Polygon, Arbitrum, Base, Avalanche), then connects via MetaMask/injected EVM wallet using `ethers.js` (already installed). All transaction-generating pages will check which chain is active and build the appropriate transaction.

## Architecture

### New Files

1. **`src/providers/EVMWalletProvider.tsx`** -- React context holding EVM wallet state: `evmAddress`, `evmChain`, `evmProvider` (ethers BrowserProvider), `evmSigner`, `connectEVM(chainId)`, `disconnectEVM()`, `isEVMConnected`. Uses `window.ethereum` + ethers.js to connect and switch chains.

2. **`src/contexts/ChainContext.tsx`** -- Simple context: `activeChain: 'solana' | 'evm'`, `evmChainId`, `setActiveChain()`. All pages read this to determine which transaction path to use.

### Modified Files

3. **`src/components/ConnectWalletButton.tsx`** -- First dialog step shows two buttons (Solana / EVM). Solana click shows current wallet list. EVM click shows chain list (Ethereum, BSC, Polygon, etc.), then calls `connectEVM(chainId)` from the EVM context. When connected, shows address with chain icon instead of `WalletMultiButton`.

4. **`src/providers/WalletProvider.tsx`** -- Wrap children with the new `EVMWalletProvider` and `ChainProvider`.

5. **`src/components/SwapInterface.tsx`** -- Add EVM transaction path: when `activeChain === 'evm'`, instead of building Solana transactions, use `evmSigner.sendTransaction()` to send native tokens (ETH/BNB/MATIC) and use ERC-20 `transfer()` calls for tokens. Keep the same UI, same CHARITY_WALLET replaced with an EVM address for EVM chains.

6. **`src/pages/Refund.tsx`** -- Same dual-path logic: check `activeChain`, build either Solana or EVM transaction.

7. **`src/pages/OTC.tsx`** -- Same dual-path logic for OTC trade execution.

8. **`src/pages/Ads.tsx`** -- Same dual-path logic for ad payment transactions.

9. **`src/pages/Charity.tsx`** -- Same dual-path logic.

10. **`src/components/Navigation.tsx`** -- Show connected chain indicator (Solana icon or EVM chain icon + address).

### EVM Chain Configuration

Supported chains with their details (chainId, name, native token, RPC):
- Ethereum (1) -- ETH
- BSC (56) -- BNB  
- Polygon (137) -- MATIC
- Arbitrum (42161) -- ETH
- Base (8453) -- ETH
- Avalanche (43114) -- AVAX

### Transaction Flow (EVM)

The EVM transaction path mirrors the Solana path:
- Send native token (ETH/BNB/etc.) to a designated EVM charity wallet address
- For ERC-20 tokens: call `transfer()` on the token contract
- Use `ethers.BrowserProvider` from `window.ethereum`
- Request chain switch via `wallet_switchEthereumChain` if needed

### No New Dependencies Needed

`ethers` v6 is already in `package.json`. All EVM wallet interaction uses the injected `window.ethereum` provider (MetaMask, Trust Wallet, Coinbase Wallet all inject this).

## Summary of Work

| Task | Scope |
|------|-------|
| Create ChainContext + EVMWalletProvider | 2 new files |
| Redesign ConnectWalletButton with chain selector | Major rewrite |
| Update WalletProvider to wrap with new contexts | Small edit |
| Add EVM tx path to SwapInterface | Medium addition |
| Add EVM tx path to Refund, OTC, Ads, Charity | Medium per page |
| Update Navigation with chain indicator | Small edit |

