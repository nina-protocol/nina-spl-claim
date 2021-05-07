const anchor = require('@project-serum/anchor');

const {
  getTokenAccount,
  createMint,
  createTokenAccount,
  TOKEN_PROGRAM_ID,
} = require("./tests/utils");

const REFILL_AMOUNT = 1000

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

    const faucetId = new anchor.web3.PublicKey('8FJiqnQxdV8oZVLWqVrqA3GxvBJnJL4xCeEae85ZiTfK');
    let faucet = await program.account.faucet(faucetId);

    const refillAmount = new anchor.BN(REFILL_AMOUNT)
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
    console.log('Faucet refilled - now contains: ', faucet.numClaimTotalAmount.toNumber() - faucet.numClaimTotalClaimed.toNumber())
  // #endregion main
}

console.log('Refilling the faucet.');
main().then(() => console.log('Success'));
