// client.js is used to introduce the reader to generating clients from IDLs.
// It is not expected users directly test with this example. For a more
// ergonomic example, see `tests/basic-0.js` in this workspace.

const anchor = require('@project-serum/anchor');

const {
  getTokenAccount,
  createMint,
  createTokenAccount,
} = require("../tests/utils");


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

  const faucet = new anchor.web3.Account();

  const [faucetSigner, nonce] = await anchor.web3.PublicKey.findProgramAddress(
    [faucet.publicKey.toBuffer()],
    program.programId
  );
  const claimMint = await createMint(provider, faucetSigner);

  const claimFaucet = await createTokenAccount(
    provider,
    claimMint,
    faucetSigner,
  );

  const tx = await program.rpc.initialize(nonce, {
    accounts: {
      faucet: faucet.publicKey,
      claimMint,
      claimFaucet,
      faucetSigner,
      faucetAuthority: provider.wallet.publicKey,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    },
    signers: [faucet],
    instructions:[await program.account.faucet.createInstruction(faucet)],
  });
  
  const faucetAccount = await program.account.faucet(faucet.publicKey);
  console.log('Faucet Address: ', faucet.publicKey.toString())

  // #endregion main
}

console.log('Initializing the faucet.');
main().then(() => console.log('Success'));
