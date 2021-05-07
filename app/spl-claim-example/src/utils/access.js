import { createContext, useState, useEffect, useContext } from 'react';
import { Program } from '@project-serum/anchor';
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
  createTokenAccount,
  TOKEN_PROGRAM_ID,
  sleep,
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
    await getFaucetInfo()
    let userClaimTokenAccount = claimTokenAccount
    if (!userClaimTokenAccount) {
      userClaimTokenAccount = await createTokenAccount(
        connection,
        wallet,
        faucet.claimMint,
        wallet.publicKey,
      );
    };

    console.log('userClaimTokenAccount: ', userClaimTokenAccount.toString())
    console.log('faucet: ', FAUCET_ACCOUNT.toString())
    console.log('faucetSigner: ', faucet.faucetSigner.toString())
    console.log('claimFaucet: ', faucet.claimFaucet.toString())
    console.log('claimMint: ', faucet.claimMint.toString())
    console.log('tokenProgram: ', TOKEN_PROGRAM_ID.toString())
    console.log('systemProgram: ', SystemProgram.programId.toString())
    console.log('SYSVAR_RENT_PUBKEY ', SYSVAR_RENT_PUBKEY.toString())
    console.log('wallet.publicKey ', wallet.publicKey.toString())
    await getFaucetInfo()

    const tx = await program.rpc.claimToken({
      accounts: {
        faucet: FAUCET_ACCOUNT,
        faucetSigner: faucet.faucetSigner,
        claimMint: faucet.claimMint,
        claimFaucet: faucet.claimFaucet,
        userClaimTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      },
    });
    await getFaucetInfo()
    await checkHasAccess()
    console.log('tx')
  }

  const getFaucetInfo = async() => {
    const options = {
      preflightCommitment: 'recent',
      commitment: 'recent',
    };

    const provider = new Provider(connection, wallet, options)
    // Address of the deployed program.
    const programId = SPL_CLAIM_PROGRAM;

    // Generate the program client from IDL.
    const program = new Program(idl, programId, provider);
    setProgram(program)
    const faucetAccount = await program.account.faucet(FAUCET_ACCOUNT);
    console.log(faucetAccount)
    setFaucet({...faucetAccount})
  }

  return {
    checkHasAccess,
    claimToken,
    getFaucetInfo,
  }
}  
