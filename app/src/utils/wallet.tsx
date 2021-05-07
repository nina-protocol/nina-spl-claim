import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  createContext,
} from 'react';
import Wallet from '@project-serum/sol-wallet-adapter';
import {useSnackbar} from 'notistack';
import {
  PhantomWalletAdapter,
  SolletExtensionAdapter,
} from './wallet-adapters';
import {
  WalletAdapter,
} from './types'

import {ConnectionContext} from './connection'

const ASSET_URL =
  'https://cdn.jsdelivr.net/gh/solana-labs/oyster@main/assets/wallets';
export const WALLET_PROVIDERS = [
  {
    name: 'sollet.io',
    url: 'https://www.sollet.io',
    icon: `${ASSET_URL}/sollet.svg`,
  },
  {
    name: 'Sollet Extension',
    url: 'https://www.sollet.io/extension',
    icon: `${ASSET_URL}/sollet.svg`,
    adapter: SolletExtensionAdapter as any,
  },
  {
    name: 'Phantom',
    url: 'https://www.phantom.app',
    icon: `https://www.phantom.app/img/logo.png`,
    adapter: PhantomWalletAdapter,
  },
];

export interface WalletContextValues {
  wallet: WalletAdapter | undefined;
  connected: boolean;
  providerUrl: string;
  provider: object | undefined,
  setProviderUrl: (newProviderUrl: string) => void;
  providerName: string;
  select: () => void;
  close: () => void;
  isModalVisible: boolean;
}

const WalletContext = React.createContext<null | WalletContextValues>(null);

export default function WalletProvider({ children }: { children: any }) {
  const { endpoint } = useContext(ConnectionContext);

  const [autoConnect, setAutoConnect] = useState(false);
  const [providerUrl, setProviderUrl] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  console.log('providerUrl , ', providerUrl);

  const provider = useMemo(
    () => WALLET_PROVIDERS.find(({ url }) => url === providerUrl),
    [providerUrl],
  );
  //update to fire on each provider button click

  let [wallet, setWallet] = useState<WalletAdapter|undefined>(undefined);

  const { enqueueSnackbar } = useSnackbar();
  useEffect(() => {
    if (provider) {
      const updateWallet = () => {
        // hack to also update wallet synchronously in case it disconnects
        // eslint-disable-next-line react-hooks/exhaustive-deps
        wallet = new (provider.adapter || Wallet)(
          providerUrl,
          endpoint,
        ) as WalletAdapter;
        setWallet(wallet);
      }

      if (document.readyState !== 'complete') {
        // wait to ensure that browser extensions are loaded
        const listener = () => {
          updateWallet();
          window.removeEventListener('load', listener);
        };
        window.addEventListener('load', listener);
        return () => window.removeEventListener('load', listener);
      } else {
        updateWallet();
        setAutoConnect(true)
      }
    }
  }, [provider, providerUrl, endpoint]);

  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (wallet) {
      wallet.on('connect', () => {
        if (wallet?.publicKey) {
          setConnected(true);
          close()
          const walletPublicKey = wallet.publicKey.toBase58();
          const keyToDisplay =
            walletPublicKey.length > 20
              ? `${walletPublicKey.substring(
                  0,
                  7,
                )}.....${walletPublicKey.substring(
                  walletPublicKey.length - 7,
                  walletPublicKey.length,
                )}`
              : walletPublicKey;
          enqueueSnackbar('Wallet connected.')
          // notify({
          //   message: 'Wallet update',
          //   description: 'Connected to wallet ' + keyToDisplay,
          // });
        }
      });

      wallet.on('disconnect', () => {
        setConnected(false);
        setProviderUrl('');
        setWallet(undefined);
        
        enqueueSnackbar('Wallet disconnected.')
        // notify({
        //   message: 'Wallet update',
        //   description: 'Disconnected from wallet',
        // });
      });
    }

    return () => {
      setConnected(false);
      if (wallet && wallet.connected) {
        wallet.disconnect();
        setConnected(false);
        setProviderUrl('');
        setWallet(undefined);
      }
    };
  }, [wallet]);

  useEffect(() => {
    if (wallet && autoConnect) {
      wallet.connect();
      setAutoConnect(false);
    }
    return () => {};
  }, [wallet, autoConnect]);

  const [isModalVisible, setIsModalVisible] = useState(false);

  const select = useCallback(() => { setIsModalVisible(true)}, []);
  const close = useCallback(() => setIsModalVisible(false), []);

  return (
    <WalletContext.Provider
      value={{
        wallet,
        connected,
        select,
        close,
        isModalVisible,
        provider,
        providerUrl,
        setProviderUrl,
        providerName:
          WALLET_PROVIDERS.find(({ url }) => url === providerUrl)?.name ??
          providerUrl,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('Missing wallet context');
  }

  const wallet = context.wallet;
  return {
    connected: context.connected,
    wallet: wallet,
    providerUrl: context.providerUrl,
    provider: context.provider,
    setProviderUrl: context.setProviderUrl,
    providerName: context.providerName,
    select: context.select,
    close: context.close,
    isModalVisible: context.isModalVisible,
    WALLET_PROVIDERS,
    connect() {
      wallet ? wallet.connect() : context.select();
    },
    disconnect() {
      wallet?.disconnect();
    },
  };
}
