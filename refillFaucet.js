// client.js is used to introduce the reader to generating clients from IDLs.
// It is not expected users directly test with this example. For a more
// ergonomic example, see `tests/basic-0.js` in this workspace.

const anchor = require('@project-serum/anchor');

const {
  getTokenAccount,
  createMint,
  createTokenAccount,
  TOKEN_PROGRAM_ID,
} = require("./tests/utils");


async function main() {
    // #region main
    const provider = anchor.Provider.env()
    anchor.setProvider(provider);

    // Read the generated IDL.
    const idl = JSON.parse(require('fs').readFileSync('./target/idl/nina_spl_claim.json', 'utf8'));

    // Address of the deployed program.
    const programId = new anchor.web3.PublicKey('4NcrT3M7DFF9CnAuFC4iWhEnxMJn3AFo5aw3zpw87XzX');

    // Generate the program client from IDL.
    const program = new anchor.Program(idl, programId);

    const faucetId = new anchor.web3.PublicKey('ATsFZKUj5cT3JDL7ghpQbheGtp7vefqXJER9DAMw4tn2');
    let faucet = await program.account.faucet(faucetId);

    const refillAmount = new anchor.BN(1000)
    const tx = await program.rpc.refillFaucet(refillAmount, {
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

    faucet = await program.account.faucet(faucetId);
    console.log('Faucet refilled - now contains: ', faucet.numClaimTotalAmount.toNumber())
  // #endregion main
}

console.log('Refilling the faucet.');
main().then(() => console.log('Success'));
