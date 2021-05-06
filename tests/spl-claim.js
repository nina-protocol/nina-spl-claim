const anchor = require('@project-serum/anchor');
const assert = require("assert");

const {
  TOKEN_PROGRAM_ID,
  sleep,
  getTokenAccount,
  createMint,
  createTokenAccount,
  mintToAccount,
} = require("./utils");

describe('nina-spl-claim', () => {
  const provider = anchor.Provider.env()
  anchor.setProvider(provider);

  const program = anchor.workspace.NinaSplClaim;

  let faucet = null;
  let claimMint = null;
  let claimFaucet = null;
  let faucetSigner = null;
  let nonce = null;
  let refillAmount = null;
  it('Is initialized!', async () => {
    faucet = new anchor.web3.Account();

    [faucetSigner, nonce] = await anchor.web3.PublicKey.findProgramAddress(
      [faucet.publicKey.toBuffer()],
      program.programId
    );
    claimMint = await createMint(provider, faucetSigner);

    claimFaucet = await createTokenAccount(
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
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
      signers: [faucet],
      instructions:[await program.account.faucet.createInstruction(faucet)],
    });
    
    const faucetAccount = await program.account.faucet(faucet.publicKey);
    assert.ok(faucetAccount.faucetSigner.equals(faucetSigner));
    assert.ok(faucetAccount.claimMint.equals(claimMint));
    assert.ok(faucetAccount.claimFaucet.equals(claimFaucet));
    assert.ok(faucetAccount.numClaimRefills.toNumber() === 0);
    assert.ok(faucetAccount.numClaimTotalAmount.toNumber() === 0);
    assert.ok(faucetAccount.numClaimTotalClaimed.toNumber() === 0);
  });

  it('Refills the faucet', async () => {
    refillAmount = new anchor.BN(1000)
    const tx = await program.rpc.refillFaucet(refillAmount, {
      accounts: {
        faucet: faucet.publicKey,
        faucetSigner,
        claimMint,
        claimFaucet,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
    });

    const faucetAccount = await program.account.faucet(faucet.publicKey);
    assert.ok(faucetAccount.numClaimRefills.toNumber() === 1);
    assert.ok(faucetAccount.numClaimTotalAmount.toNumber() === refillAmount.toNumber());
    assert.ok(faucetAccount.numClaimTotalClaimed.toNumber() === 0);    
  })

  it('Dispense a claim from the faucet', async () => {
    
    const userClaimTokenAccount = await createTokenAccount(
      provider,
      claimMint,
      provider.wallet.publicKey,
    );

    const tx = await program.rpc.claimToken({
      accounts: {
        faucet: faucet.publicKey,
        faucetSigner,
        claimMint,
        claimFaucet,
        userClaimTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
    });

    const faucetAccount = await program.account.faucet(faucet.publicKey);
    assert.ok(faucetAccount.numClaimRefills.toNumber() === 1);

    const userClaimAccount = await getTokenAccount(provider, userClaimTokenAccount);
    assert.ok(userClaimAccount.amount.toNumber() === 1);

    const claimFaucetTokenAccount = await getTokenAccount(provider, claimFaucet);
    assert.ok(claimFaucetTokenAccount.amount.toNumber() === refillAmount.toNumber() - 1);
  })

  it('Closes the faucet', async () => {
    let claimFaucetTokenAccount = await getTokenAccount(provider, claimFaucet);

    const tx = await program.rpc.closeFaucet(claimFaucetTokenAccount.amount, {
      accounts: {
        faucet: faucet.publicKey,
        faucetSigner,
        claimMint,
        claimFaucet,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
    });

    claimFaucetTokenAccount = await getTokenAccount(provider, claimFaucet);
    assert.ok(claimFaucetTokenAccount.amount.toNumber() === 0);

  })
});
