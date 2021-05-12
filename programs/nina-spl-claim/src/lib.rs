use anchor_lang::prelude::*;
use anchor_lang::solana_program::program_option::COption;
use anchor_spl::token::{self, Burn, Mint, MintTo, TokenAccount, Transfer};

#[program]
pub mod nina_spl_claim {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        nonce: u8,
    ) -> ProgramResult {
        let faucet = &mut ctx.accounts.faucet;
        faucet.faucet_signer = *ctx.accounts.faucet_signer.to_account_info().key;
        faucet.faucet_authority = *ctx.accounts.faucet_authority.to_account_info().key;
        faucet.claim_mint = *ctx.accounts.claim_mint.to_account_info().key;
        faucet.claim_faucet = *ctx.accounts.claim_faucet.to_account_info().key;
        faucet.nonce = nonce;
        faucet.num_claim_refills = 0;
        faucet.num_claim_total_claimed = 0;
        faucet.num_claim_total_amount = 0;

        Ok(())
    }

    pub fn refill_faucet(
        ctx: Context<RefillFaucet>,
        amount: u64,
    ) -> ProgramResult {
        let faucet = &mut ctx.accounts.faucet;

        let cpi_program = ctx.accounts.token_program.clone();

        let cpi_accounts = MintTo {
            mint: ctx.accounts.claim_mint.to_account_info(),
            to: ctx.accounts.claim_faucet.to_account_info(),
            authority: ctx.accounts.faucet_signer.clone(),
        };

        let seeds = &[
            faucet.to_account_info().key.as_ref(),
            &[faucet.nonce],
        ];
        let signer = &[&seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::mint_to(cpi_ctx, amount)?;

        faucet.num_claim_refills += 1;
        faucet.num_claim_total_amount += amount;

        Ok(())
    }

    pub fn claim_token(
        ctx: Context<ClaimToken>,
    ) -> ProgramResult {
        if ctx.accounts.user_claim_token_account.amount > 0 {
            return Err(ErrorCode::AlreadyClaimed.into());
        }

        let faucet = &mut ctx.accounts.faucet;

        let cpi_accounts = Transfer {
            from: ctx.accounts.claim_faucet.to_account_info(),
            to: ctx.accounts.user_claim_token_account.to_account_info(),
            authority: ctx.accounts.faucet_signer.clone(),
        };

        let cpi_program = ctx.accounts.token_program.to_account_info();
        
        let seeds = &[
            faucet.to_account_info().key.as_ref(),
            &[faucet.nonce],
        ];
        let signer = &[&seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, 1)?;

        faucet.num_claim_total_claimed += 1;
        
        Ok(())
    }

    pub fn close_faucet(
        ctx: Context<CloseFaucet>,
        amount: u64,
    ) -> ProgramResult {
        let faucet = &mut ctx.accounts.faucet;

        // Burn remaining faucet tokens.
        let cpi_accounts = Burn {
            mint: ctx.accounts.claim_mint.to_account_info(),
            to: ctx.accounts.claim_faucet.to_account_info(),
            authority: ctx.accounts.faucet_signer.to_account_info(),
        };

        let cpi_program = ctx.accounts.token_program.clone();
        
        let seeds = &[
            faucet.to_account_info().key.as_ref(),
            &[faucet.nonce],
        ];
        let signer = &[&seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::burn(cpi_ctx, amount)?;

        faucet.num_claim_total_amount -= amount;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init)]
    pub faucet: ProgramAccount<'info, Faucet>,
    pub faucet_authority: AccountInfo<'info>,
    pub faucet_signer: AccountInfo<'info>,
    pub claim_mint: CpiAccount<'info, Mint>,
    pub claim_faucet: CpiAccount<'info, TokenAccount>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct RefillFaucet<'info> {
    #[account(seeds = [faucet.to_account_info().key.as_ref(), &[faucet.nonce]])]
    pub faucet_signer: AccountInfo<'info>,
    #[account(mut, has_one = claim_faucet, has_one = faucet_authority)]
    pub faucet: ProgramAccount<'info, Faucet>,
    #[account(
        mut,
        "claim_mint.mint_authority == COption::Some(*faucet_signer.key)"
    )]
    pub claim_mint: CpiAccount<'info, Mint>,
    #[account(mut)]
    pub claim_faucet: CpiAccount<'info, TokenAccount>,
    #[account(signer)]
    pub authority: AccountInfo<'info>,
    #[account(mut, "faucet_authority.key == authority.key")]
    pub faucet_authority: AccountInfo<'info>,
    pub token_program: AccountInfo<'info>,
    pub system_program: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct ClaimToken<'info> {
    #[account(seeds = [faucet.to_account_info().key.as_ref(), &[faucet.nonce]])]
    pub faucet_signer: AccountInfo<'info>,
    #[account(mut)]
    pub faucet: ProgramAccount<'info, Faucet>,
    #[account(
        mut,
        "claim_mint.mint_authority == COption::Some(*faucet_signer.key)"
    )]
    pub claim_mint: CpiAccount<'info, Mint>,
    #[account(mut)]
    pub claim_faucet: CpiAccount<'info, TokenAccount>,
    #[account(mut)]
    pub user_claim_token_account: CpiAccount<'info, TokenAccount>,
    pub token_program: AccountInfo<'info>,
    pub system_program: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct CloseFaucet<'info> {
    #[account(seeds = [faucet.to_account_info().key.as_ref(), &[faucet.nonce]])]
    pub faucet_signer: AccountInfo<'info>,
    #[account(mut, has_one = claim_faucet, has_one = faucet_authority)]
    pub faucet: ProgramAccount<'info, Faucet>,
    #[account(
        mut,
        "claim_mint.mint_authority == COption::Some(*faucet_signer.key)"
    )]
    pub claim_mint: CpiAccount<'info, Mint>,
    #[account(mut)]
    pub claim_faucet: CpiAccount<'info, TokenAccount>,
    #[account(signer)]
    pub authority: AccountInfo<'info>,
    #[account(mut, "faucet_authority.key == authority.key")]
    pub faucet_authority: AccountInfo<'info>,
    pub token_program: AccountInfo<'info>,
    pub system_program: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>,
}

#[account]
pub struct Faucet {
    pub faucet_signer: Pubkey,
    pub faucet_authority: Pubkey,
    pub claim_mint: Pubkey,
    pub claim_faucet: Pubkey,
    pub nonce: u8,
    pub num_claim_refills: u64,
    pub num_claim_total_amount: u64,
    pub num_claim_total_claimed: u64,
}

#[error]
pub enum ErrorCode {
    #[msg("Already claimed token")]
    AlreadyClaimed,
}
