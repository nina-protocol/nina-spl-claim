import React, { useState, useContext, useEffect } from 'react';
import Button from '@material-ui/core/Button'

import {AccessContext} from '../utils/access'
import {useWallet} from '../utils/wallet'

import Wallet from './Wallet'

const Home = () => {
  const {claimToken, hasAccess, faucet, getFaucetInfo} = useContext(AccessContext);
  const {wallet, connected} = useWallet()
  const [faucetState, setFaucetState] = useState(undefined)
  const [hasAccessState, setHasAccessState] = useState(false)

  useEffect(() => {
    setHasAccessState(hasAccess)
  }, [hasAccess])

  // useEffect(() => {
  //   getFaucetInfo()
  //   console.log('gettting faucet info')
  // }, [])

  useEffect(() => {
    console.log('FAUCET: ', faucet)
    setFaucetState(faucet)
  }, [faucet?.nonce])

  const onClick = () => {
    claimToken()
  }

  return(
    <div className="container">
      <div className="columns hp__columns">
        {!connected &&
          <Wallet />
        }
        {connected && hasAccessState &&
          <p>You have access!</p>
        }
        {connected && !hasAccessState &&
          <Button
            className="nav__button"
            variant="contained"
            color="primary"
            onClick={onClick}
          >
            Claim Token
          </Button>
        }
        {faucetState &&
          <div>
            <p>There are {faucetState.numClaimTotalAmount.toNumber() - faucetState.numClaimTotalClaimed.toNumber()} / {faucetState.numClaimTotalAmount.toNumber()} beta spots open</p>
          </div>
        }
      </div>
    </div>
  )
}

export default Home
