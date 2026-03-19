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

interface InjectedEthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}

const EVMWalletContext = createContext<EVMWalletContextType | undefined>(undefined);

const getInjectedProvider = (): InjectedEthereumProvider | null => {
  if (typeof window === 'undefined') return null;
  return ((window as Window & { ethereum?: InjectedEthereumProvider }).ethereum ?? null);
};

export const EVMWalletProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [evmAddress, setEvmAddress] = useState<string | null>(null);
  const [evmProvider, setEvmProvider] = useState<ethers.BrowserProvider | null>(null);
  const [evmSigner, setEvmSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const { setActiveChain, setEvmChainId } = useChain();
  const pendingChainId = useRef<number | null>(null);
  
  const { login, logout, authenticated, ready } = usePrivy();
  const { wallets } = useWallets();

  const syncWalletState = useCallback(async (wallet: {
    address: string;
    getEthereumProvider: () => Promise<ethers.Eip1193Provider>;
  }) => {
    const ethereumProvider = await wallet.getEthereumProvider();
    const browserProvider = new ethers.BrowserProvider(ethereumProvider);
    const signer = await browserProvider.getSigner();
    const network = await browserProvider.getNetwork();

    setEvmAddress(wallet.address);
    setEvmProvider(browserProvider);
    setEvmSigner(signer);
    setEvmChainId(Number(network.chainId));
  }, [setEvmChainId]);

  const requestInjectedWalletChain = useCallback(async (chainId: number) => {
    const chain = EVM_CHAINS.find((item) => item.chainId === chainId);
    const injectedProvider = getInjectedProvider();

    if (!chain || !injectedProvider) return;

    try {
      await injectedProvider.request({ method: 'eth_requestAccounts' });
      await injectedProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chain.chainIdHex }],
      });
    } catch (error: any) {
      if (error?.code === 4902) {
        await injectedProvider.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: chain.chainIdHex,
            chainName: chain.name,
            nativeCurrency: {
              name: chain.nativeToken,
              symbol: chain.shortName,
              decimals: 18,
            },
            rpcUrls: [chain.rpcUrl],
            blockExplorerUrls: [chain.blockExplorer],
          }],
        });

        await injectedProvider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chain.chainIdHex }],
        });
        return;
      }

      throw error;
    }
  }, []);

  useEffect(() => {
    const syncWallet = async () => {
      if (!ready || !authenticated || wallets.length === 0) return;
      
      const evmWallet = wallets.find((wallet) => wallet.walletClientType !== 'solana');
      if (!evmWallet) return;

      try {
        if (pendingChainId.current !== null) {
          const targetChain = pendingChainId.current;
          pendingChainId.current = null;

          try {
            await evmWallet.switchChain(targetChain);
            toast.success(`Connected to ${EVM_CHAINS.find((chain) => chain.chainId === targetChain)?.name || 'EVM'}`);
          } catch (switchErr) {
            console.error('Failed to switch chain after login:', switchErr);
            pendingChainId.current = targetChain;
          }
        }

        await syncWalletState(evmWallet);
      } catch (err) {
        console.error('Failed to sync Privy wallet:', err);
      }
    };

    syncWallet();
  }, [ready, authenticated, wallets, syncWalletState]);

  const switchChain = useCallback(async (chainId: number) => {
    const evmWallet = wallets.find((wallet) => wallet.walletClientType !== 'solana');
    if (!evmWallet) throw new Error('No EVM wallet connected');

    try {
      await evmWallet.switchChain(chainId);
      await syncWalletState(evmWallet);
    } catch (err: any) {
      console.error('Chain switch error:', err);
      throw err;
    }
  }, [wallets, syncWalletState]);

  const connectEVM = useCallback(async (chainId: number) => {
    try {
      setActiveChain('evm');
      pendingChainId.current = chainId;

      if (!authenticated) {
        await requestInjectedWalletChain(chainId);
        login();
        return;
      }

      if (wallets.length > 0) {
        await switchChain(chainId);
        toast.success(`Connected to ${EVM_CHAINS.find((chain) => chain.chainId === chainId)?.name || 'EVM'}`);
      }
    } catch (error: any) {
      console.error('EVM connection error:', error);
      toast.error('Failed to connect EVM wallet: ' + (error?.message || 'Unknown error'));
    }
  }, [authenticated, login, wallets, switchChain, setActiveChain, requestInjectedWalletChain]);

  const disconnectEVM = useCallback(() => {
    setEvmAddress(null);
    setEvmProvider(null);
    setEvmSigner(null);
    setActiveChain('solana');
    setEvmChainId(null);
    pendingChainId.current = null;
    
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
