import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode, FC } from 'react';
import { ethers } from 'ethers';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useChain, EVM_CHAINS } from '@/contexts/ChainContext';
import { toast } from 'sonner';

interface EVMWalletContextType {
  evmAddress: string | null;
  evmProvider: ethers.BrowserProvider | null;
  evmSigner: ethers.JsonRpcSigner | null;
  isEVMConnected: boolean;
  connectEVM: (chainId: number) => Promise<void>;
  disconnectEVM: () => void;
  switchChain: (chainId: number) => Promise<void>;
}

const EVMWalletContext = createContext<EVMWalletContextType | undefined>(undefined);

export const EVMWalletProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [evmAddress, setEvmAddress] = useState<string | null>(null);
  const [evmProvider, setEvmProvider] = useState<ethers.BrowserProvider | null>(null);
  const [evmSigner, setEvmSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const { setActiveChain, setEvmChainId } = useChain();
  const pendingChainId = useRef<number | null>(null);
  
  const { login, logout, authenticated, ready } = usePrivy();
  const { wallets } = useWallets();

  // Sync Privy wallet state and handle pending chain switch
  useEffect(() => {
    const syncWallet = async () => {
      if (!ready || !authenticated || wallets.length === 0) return;
      
      const evmWallet = wallets.find(w => w.walletClientType !== 'solana');
      if (!evmWallet) return;

      try {
        // If there's a pending chain switch, do it first
        if (pendingChainId.current !== null) {
          const targetChain = pendingChainId.current;
          pendingChainId.current = null;
          try {
            await evmWallet.switchChain(targetChain);
            setEvmChainId(targetChain);
            toast.success(`Connected to ${EVM_CHAINS.find(c => c.chainId === targetChain)?.name || 'EVM'}`);
          } catch (switchErr) {
            console.error('Failed to switch chain after login:', switchErr);
          }
        }

        const ethereumProvider = await evmWallet.getEthereumProvider();
        const browserProvider = new ethers.BrowserProvider(ethereumProvider);
        const signer = await browserProvider.getSigner();
        
        setEvmAddress(evmWallet.address);
        setEvmProvider(browserProvider);
        setEvmSigner(signer);
      } catch (err) {
        console.error('Failed to sync Privy wallet:', err);
      }
    };

    syncWallet();
  }, [ready, authenticated, wallets]);

  const switchChain = useCallback(async (chainId: number) => {
    const evmWallet = wallets.find(w => w.walletClientType !== 'solana');
    if (!evmWallet) throw new Error('No EVM wallet connected');

    try {
      await evmWallet.switchChain(chainId);
      setEvmChainId(chainId);

      // Refresh provider/signer after chain switch
      const ethereumProvider = await evmWallet.getEthereumProvider();
      const browserProvider = new ethers.BrowserProvider(ethereumProvider);
      const signer = await browserProvider.getSigner();
      setEvmProvider(browserProvider);
      setEvmSigner(signer);
    } catch (err: any) {
      console.error('Chain switch error:', err);
      throw err;
    }
  }, [wallets, setEvmChainId]);

  const connectEVM = useCallback(async (chainId: number) => {
    try {
      setActiveChain('evm');
      setEvmChainId(chainId);

      if (!authenticated) {
        // Store desired chain so useEffect switches after login
        pendingChainId.current = chainId;
        login();
        return;
      }

      // Already authenticated, switch chain immediately
      if (wallets.length > 0) {
        await switchChain(chainId);
        toast.success(`Connected to ${EVM_CHAINS.find(c => c.chainId === chainId)?.name || 'EVM'}`);
      }
    } catch (error: any) {
      console.error('EVM connection error:', error);
      toast.error('Failed to connect EVM wallet: ' + (error?.message || 'Unknown error'));
    }
  }, [authenticated, login, wallets, switchChain, setActiveChain, setEvmChainId]);

  const disconnectEVM = useCallback(() => {
    setEvmAddress(null);
    setEvmProvider(null);
    setEvmSigner(null);
    setActiveChain('solana');
    setEvmChainId(null);
    
    if (authenticated) {
      logout();
    }
  }, [authenticated, logout, setActiveChain, setEvmChainId]);

  return (
    <EVMWalletContext.Provider value={{
      evmAddress,
      evmProvider,
      evmSigner,
      isEVMConnected: !!evmAddress,
      connectEVM,
      disconnectEVM,
      switchChain,
    }}>
      {children}
    </EVMWalletContext.Provider>
  );
};

export const useEVMWallet = () => {
  const ctx = useContext(EVMWalletContext);
  if (!ctx) throw new Error('useEVMWallet must be used within EVMWalletProvider');
  return ctx;
};
