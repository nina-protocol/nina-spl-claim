// client.js is used to introduce the reader to generating clients from IDLs.
// It is not expected users directly test with this example. For a more
// ergonomic example, see `tests/basic-0.js` in this workspace.

const anchor = require('@project-serum/anchor');

const {
  TOKEN_PROGRAM_ID,
  getTokenAccount,
} = require("../tests/utils");

const FAUCET_ACCONUT = require('./faucet');

async function main() {
  // #region main
  const provider = anchor.Provider.env()
  anchor.setProvider(provider);

  // Read the generated IDL.
  const idl = JSON.parse(require('fs').readFileSync('./target/idl/nina_spl_claim.json', 'utf8'));

  // Address of the deployed program.
  const programId = new anchor.web3.PublicKey('XYdpvyWpYwxPWNLSMdUYE9H6Myqprc3TahdvRYkBVe7');

  // Generate the program client from IDL.
  const program = new anchor.Program(idl, programId);

  // Get the faucet that you want to refill
  const faucetId = FAUCET_ACCONUT;
  let faucet = await program.account.faucet(faucetId);

  let claimFaucetTokenAccount = await getTokenAccount(provider, faucet.claimFaucet);

  const tx = await program.rpc.closeFaucet(claimFaucetTokenAccount.amount, {
    accounts: {
      faucet: faucetId,
      faucetSigner: faucet.faucetSigner,
      claimMint: faucet.claimMint,
      claimFaucet: faucet.claimFaucet,
      authority: provider.wallet.publicKey,
      faucetAuthority: faucet.faucetAuthority,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    },
  });

  const faucetAccount = await program.account.faucet(faucetId);

  claimFaucetTokenAccount = await getTokenAccount(provider, faucet.claimFaucet);
  console.log('Faucet amount: ', claimFaucetTokenAccount.amount.toNumber())

  // #endregion main
}

console.log('Closing the faucet.');
main().then(() => console.log('Success'));
