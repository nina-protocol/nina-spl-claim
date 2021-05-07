import { SnackbarProvider } from 'notistack';

import ConnectionContextProvider from './utils/connection';
import WalletContextProvider from './utils/wallet';
import AccessContextProvider from './utils/access';

import Router from './routes'

function App() {
  return (
    <SnackbarProvider 
      maxSnack={3} 
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
    >
      <ConnectionContextProvider>
        <WalletContextProvider>
          <AccessContextProvider>
            <Router />
          </AccessContextProvider>
        </WalletContextProvider>
      </ConnectionContextProvider>
    </SnackbarProvider>
  )
}

export default App;
