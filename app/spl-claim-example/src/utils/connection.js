import { createContext, useState, useMemo, useEffect, useContext } from 'react';
import { Account, AccountInfo, Connection, PublicKey } from '@solana/web3.js';

export const ConnectionContext = createContext()

export const ENDPOINTS = [
  {
    name: 'devnet',
    endpoint: 'https://devnet.solana.com',
    custom: false,
  },
];

const ConnectionContextProvider = (props) => {
  const [endpoint, setEndpoint] = useState(ENDPOINTS[0].endpoint)
  const connection = useMemo(() => new Connection(endpoint, 'recent'), [endpoint]);

  return (
    <ConnectionContext.Provider
      value={{
        endpoint,
        connection,
      }}
    >
      {props.children}
    </ConnectionContext.Provider>
  );
}

export default ConnectionContextProvider
