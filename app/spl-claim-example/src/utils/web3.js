const {
  Account,
  PublicKey,
  SystemProgram,
  Transaction,
} = require('@solana/web3.js');

const TokenInstructions = require("@project-serum/serum").TokenInstructions;

// TODO: remove this constant once @project-serum/serum uses the same version
//       of @solana/web3.js as anchor (or switch packages).
const TOKEN_PROGRAM_ID = new PublicKey(
  TokenInstructions.TOKEN_PROGRAM_ID.toString()
);

async function createTokenAccount(
  connection,
  wallet,
  mint,
  owner
) {
  const vault = new Account();
  
  let { blockhash } = await connection.getRecentBlockhash();
  const tx = new Transaction({
    recentBlockhash: blockhash,
    feePayer: wallet.publicKey,
  });
  
  tx.add(
    ...(await createTokenAccountInstrs(connection, wallet, vault.publicKey, mint, owner))
  );
  tx.setSigners(wallet.publicKey, vault.publicKey)
  tx.partialSign(vault)
  let signed = await wallet.signTransaction(tx);
  let txid = await connection.sendRawTransaction(signed.serialize());
  await connection.confirmTransaction(txid, 'finalized');

  return vault.publicKey;
}

async function createTokenAccountInstrs(
  connection,
  wallet,
  newAccountPubkey,
  mint,
  owner,
  lamports
) {
  if (lamports === undefined) {
    lamports = await connection.getMinimumBalanceForRentExemption(165);
  }
  return [
    SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey,
      space: 165,
      lamports,
      programId: TOKEN_PROGRAM_ID,
    }),
    TokenInstructions.initializeAccount({
      account: newAccountPubkey,
      mint,
      owner,
    }),
  ];
}

module.exports = {
  TOKEN_PROGRAM_ID,
  createTokenAccount,
};
