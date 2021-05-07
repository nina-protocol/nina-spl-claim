const {
  Account,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  SYSVAR_RENT_PUBKEY,
} = require('@solana/web3.js');

const TokenInstructions = require("@project-serum/serum").TokenInstructions;

const TOKEN_PROGRAM_ID = new PublicKey(
  TokenInstructions.TOKEN_PROGRAM_ID.toString()
);

const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
);

const findAssociatedTokenAddress = async (
  walletAddress,
  tokenMintAddress
) => {
  return (
    await PublicKey.findProgramAddress(
      [walletAddress.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), tokenMintAddress.toBuffer()],
      ASSOCIATED_TOKEN_PROGRAM_ID
    )
  )[0]
};

const findOrCreateAssociatedTokenAccount = async(
  connection,
  wallet,
  systemProgramId,
  clockSysvarId,
  splTokenMintAddress
) => {
  const associatedTokenAddress = await findAssociatedTokenAddress(
    wallet.publicKey,
    splTokenMintAddress
  );

  const userAssociatedTokenAddress = await connection.getParsedTokenAccountsByOwner(
    wallet.publicKey,
    {mint: splTokenMintAddress}
  )
  
  if (!userAssociatedTokenAddress.value.length > 0) {

    const keys = [
      {
        pubkey: wallet.publicKey,
        isSigner: true,
        isWritable: true
      },
      {
        pubkey: associatedTokenAddress,
        isSigner: false,
        isWritable: true
      },
      {
        pubkey: wallet.publicKey,
        isSigner: false,
        isWritable: false
      },
      {
        pubkey: splTokenMintAddress,
        isSigner: false,
        isWritable: false
      },
      {
        pubkey: systemProgramId,
        isSigner: false,
        isWritable: false
      },
      {
        pubkey: TOKEN_PROGRAM_ID,
        isSigner: false,
        isWritable: false
      },
      {
        pubkey: SYSVAR_RENT_PUBKEY,
        isSigner: false,
        isWritable: false
      }
    ];

    const ix = new TransactionInstruction({
      keys,
      programId: ASSOCIATED_TOKEN_PROGRAM_ID,
      data: Buffer.from([])
    });

    let { blockhash } = await connection.getRecentBlockhash();

    const tx = new Transaction({
      recentBlockhash: blockhash,
      feePayer: wallet.publicKey,
    });    
    tx.add(ix);
    tx.setSigners(wallet.publicKey);

    let signed = await wallet.signTransaction(tx);
    let txid = await connection.sendRawTransaction(signed.serialize());
    // await connection.confirmTransaction(txid, 'finalized');

    console.log('created: ', associatedTokenAddress);
    return associatedTokenAddress;
  } else {
    return associatedTokenAddress;
  }
}

module.exports = {
  TOKEN_PROGRAM_ID,
  findOrCreateAssociatedTokenAccount,
};
