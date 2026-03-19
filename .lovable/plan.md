

# Fix: EVM Chain Not Switching After Privy Login

## Problem

When a user selects BSC, Polygon, or Base, `connectEVM(chainId)` is called. If the user is not yet authenticated, it calls `login()` (Privy SIWE) which always connects on Ethereum chain 1. The `useEffect` that syncs the wallet after login never calls `switchChain()` to move to the requested chain.

## Root Cause

In `src/providers/EVMWalletProvider.tsx`:
- `connectEVM()` calls `login()` when not authenticated, but `login()` is async and doesn't await
- After Privy login completes, the `useEffect` syncs address/provider but does NOT switch to the desired chain
- The desired `chainId` is set in context but the wallet itself stays on Ethereum

## Fix (single file: `src/providers/EVMWalletProvider.tsx`)

1. Add a `pendingChainId` ref to store the chain the user requested before login
2. In `connectEVM()`, when not authenticated, store the desired chainId in the ref before calling `login()`
3. In the `useEffect` that fires after authentication, check `pendingChainId` and call `switchChain()` to move the wallet to the correct chain
4. Clear `pendingChainId` after successful switch

This ensures that after Privy login completes on Ethereum, the wallet immediately switches to BSC (56), Polygon (137), or Base (8453) as the user requested.

## Technical Detail

```text
User clicks BSC → connectEVM(56)
  → not authenticated → store pendingChainId = 56 → login()
  → Privy connects on Ethereum (default)
  → useEffect fires (authenticated + wallets ready)
  → sees pendingChainId = 56
  → calls switchChain(56) → wallet switches to BSC
  → clears pendingChainId
```

No other files need changes.

