import { createContext, useContext, useState, useCallback, ReactNode, FC } from 'react';
import { ethers } from 'ethers';
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

  const switchChain = useCallback(async (chainId: number) => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) throw new Error('No EVM wallet found');

    const chain = EVM_CHAINS.find(c => c.chainId === chainId);
    if (!chain) throw new Error('Unsupported chain');

    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chain.chainIdHex }],
      });
    } catch (switchError: any) {
      // Chain not added yet — add it
      if (switchError.code === 4902) {
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: chain.chainIdHex,
            chainName: chain.name,
            nativeCurrency: {
              name: chain.nativeToken,
              symbol: chain.nativeToken,
              decimals: 18,
            },
            rpcUrls: [chain.rpcUrl],
            blockExplorerUrls: [chain.blockExplorer],
          }],
        });
      } else {
        throw switchError;
      }
    }
  }, []);

  const connectEVM = useCallback(async (chainId: number) => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      toast.error('No EVM wallet detected. Please install MetaMask or another EVM wallet.');
      return;
    }

    try {
      // Switch to the desired chain first
      await switchChain(chainId);

      // Request accounts
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      
      setEvmAddress(accounts[0]);
      setEvmProvider(provider);
      setEvmSigner(signer);
      setActiveChain('evm');
      setEvmChainId(chainId);

      // Listen for account/chain changes
      ethereum.on('accountsChanged', (newAccounts: string[]) => {
        if (newAccounts.length === 0) {
          disconnectEVM();
        } else {
          setEvmAddress(newAccounts[0]);
        }
      });

      ethereum.on('chainChanged', (newChainIdHex: string) => {
        const newChainId = parseInt(newChainIdHex, 16);
        setEvmChainId(newChainId);
        // Refresh provider
        const newProvider = new ethers.BrowserProvider(ethereum);
        setEvmProvider(newProvider);
        newProvider.getSigner().then(setEvmSigner);
      });

      toast.success(`Connected to ${EVM_CHAINS.find(c => c.chainId === chainId)?.name || 'EVM'}`);
    } catch (error: any) {
      console.error('EVM connection error:', error);
      toast.error('Failed to connect EVM wallet: ' + (error?.message || 'Unknown error'));
    }
  }, [switchChain, setActiveChain, setEvmChainId]);

  const disconnectEVM = useCallback(() => {
    setEvmAddress(null);
    setEvmProvider(null);
    setEvmSigner(null);
    setActiveChain('solana');
    setEvmChainId(null);

    const ethereum = (window as any).ethereum;
    if (ethereum) {
      ethereum.removeAllListeners?.('accountsChanged');
      ethereum.removeAllListeners?.('chainChanged');
    }
  }, [setActiveChain, setEvmChainId]);

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
