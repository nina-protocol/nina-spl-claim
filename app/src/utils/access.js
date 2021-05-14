import { createContext, useState, useEffect, useContext } from 'react';
import * as anchor from '@project-serum/anchor';
import { Provider } from '@project-serum/common';

import {
  Account,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from '@solana/web3.js';

import { useSnackbar } from 'notistack';

import {ConnectionContext} from './connection'
import {useWallet} from './wallet'

import {
  SPL_CLAIM_PROGRAM,
  FAUCET_ACCOUNT,
} from './faucet'

import {
  findOrCreateAssociatedTokenAccount,
  TOKEN_PROGRAM_ID,
} from './web3'

import {idl} from './idl'

export const AccessContext = createContext()

const AccessContextProvider = (props) => {
  const {wallet, connected} = useWallet()
  const {connection} = useContext(ConnectionContext)

  const [hasAccess, setHasAccess] = useState(false);
  const [claimTokenAccount, setClaimTokenAccount] = useState(undefined)
  const [faucet, setFaucet] = useState(undefined);
  const [program, setProgram] = useState(undefined);

  const { enqueueSnackbar } = useSnackbar();

  const {
    checkHasAccess,
    claimToken,
    getFaucetInfo,
  } = accessContextHelper(
    hasAccess,
    setHasAccess,
    faucet,
    setFaucet,
    program,
    setProgram,
    claimTokenAccount,
    setClaimTokenAccount,
    connection,
    wallet,
  )

  useEffect(() => {
    if (connected) {
      checkHasAccess()
    } else {
      setHasAccess(false)
    }
  },[connected, connection])

  useEffect(() => {
    getFaucetInfo()
  }, [])

  return (
    <AccessContext.Provider
      value={{
        hasAccess,
        claimToken,
        getFaucetInfo,
        faucet,
      }}
    >
      {props.children}
    </AccessContext.Provider>
  );
}

export default AccessContextProvider

const accessContextHelper = (
  hasAccess,
  setHasAccess,
  faucet,
  setFaucet,
  program,
  setProgram,
  claimTokenAccount,
  setClaimTokenAccount,
  connection,
  wallet,
) => {

  const checkHasAccess = async () => {
    if (wallet?.connected) {
      try {
        let tokenAccounts = await connection.getParsedTokenAccountsByOwner(
          wallet.publicKey,
          {mint: faucet.claimMint}
        )
        if (tokenAccounts.value.length > 0) {
          tokenAccounts.value.forEach(account => {
            if (account.account.data.parsed.info.tokenAmount.uiAmount > 0) {
              setHasAccess(true)
            } else {
              setClaimTokenAccount(account.account.pubkey)
            }
          })
        } 
      } catch (e) {
        console.log('error: ', e)
        return
      }
    } else {
      console.log('wallet not connected')
      return
    }
  }

  const claimToken = async () => {
    const programId = SPL_CLAIM_PROGRAM;
    const provider = new anchor.Provider(connection, wallet, anchor.Provider.defaultOptions())
    const program = new anchor.Program(idl, programId, provider);
    const faucetAccount = await program.account.faucet(FAUCET_ACCOUNT);
    
    let [userClaimTokenAccount, ix] = await findOrCreateAssociatedTokenAccount(
      connection,
      wallet,
      SystemProgram.programId,
      SYSVAR_RENT_PUBKEY,
      faucet.claimMint
    )

    let request = {
      accounts: {
        faucet: FAUCET_ACCOUNT,
        faucetSigner: faucetAccount.faucetSigner,
        claimMint: faucetAccount.claimMint,
        claimFaucet: faucetAccount.claimFaucet,
        userClaimTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      }
    }
    if (ix) {
      request.instructions = [ix]
    }

    try {
      await program.rpc.claimToken(request);
      await getFaucetInfo()
      await checkHasAccess()
    } catch (error) {
      console.log(error)
    }
  }

  const getFaucetInfo = async() => {
    const options = {
      preflightCommitment: 'recent',
      commitment: 'recent',
    };

    const programId = SPL_CLAIM_PROGRAM;
    const provider = new anchor.Provider(connection, wallet, anchor.Provider.defaultOptions())
    const program = new anchor.Program(idl, programId, provider);
    const faucetAccount = await program.account.faucet(FAUCET_ACCOUNT);
    setFaucet({...faucetAccount})
  }

  return {
    checkHasAccess,
    claimToken,
    getFaucetInfo,
  }
}  
