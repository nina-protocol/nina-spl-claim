// client.js is used to introduce the reader to generating clients from IDLs.
// It is not expected users directly test with this example. For a more
// ergonomic example, see `tests/basic-0.js` in this workspace.

const anchor = require('@project-serum/anchor');

const {
  TOKEN_PROGRAM_ID,
  getTokenAccount,
} = require("../tests/utils");


async function main() {
  // #region main
  const provider = anchor.Provider.env()
  anchor.setProvider(provider);

  // Read the generated IDL.
  const idl = JSON.parse(require('fs').readFileSync('./target/idl/nina_spl_claim.json', 'utf8'));

  // Address of the deployed program.
  const programId = new anchor.web3.PublicKey('FMuM2X5T4sju5zE6NHexuYyHX2WjL5qZmwSSYq4WdGKK');

  // Generate the program client from IDL.
  const program = new anchor.Program(idl, programId);

  // Get the faucet that you want to refill
  const faucetId = new anchor.web3.PublicKey('8FJiqnQxdV8oZVLWqVrqA3GxvBJnJL4xCeEae85ZiTfK');
  let faucet = await program.account.faucet(faucetId);

  let claimFaucetTokenAccount = await getTokenAccount(provider, faucet.claimFaucet);

  const tx = await program.rpc.closeFaucet(claimFaucetTokenAccount.amount, {
    accounts: {
      faucet: faucetId,
      faucetSigner: faucet.faucetSigner,
      claimMint: faucet.claimMint,
      claimFaucet: faucet.claimFaucet,
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
