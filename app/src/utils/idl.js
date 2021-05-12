export const idl = {
  "version": "0.0.0",
  "name": "nina_spl_claim",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "faucet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "faucetAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "faucetSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "claimMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "claimFaucet",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "nonce",
          "type": "u8"
        }
      ]
    },
    {
      "name": "refillFaucet",
      "accounts": [
        {
          "name": "faucetSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "faucet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "claimMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "claimFaucet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "faucetAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "claimToken",
      "accounts": [
        {
          "name": "faucetSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "faucet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "claimMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "claimFaucet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userClaimTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "closeFaucet",
      "accounts": [
        {
          "name": "faucetSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "faucet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "claimMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "claimFaucet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "faucetAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "Faucet",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "faucetSigner",
            "type": "publicKey"
          },
          {
            "name": "faucetAuthority",
            "type": "publicKey"
          },
          {
            "name": "claimMint",
            "type": "publicKey"
          },
          {
            "name": "claimFaucet",
            "type": "publicKey"
          },
          {
            "name": "nonce",
            "type": "u8"
          },
          {
            "name": "numClaimRefills",
            "type": "u64"
          },
          {
            "name": "numClaimTotalAmount",
            "type": "u64"
          },
          {
            "name": "numClaimTotalClaimed",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 100,
      "name": "AlreadyClaimed",
      "msg": "Already claimed token"
    }
  ],
  "metadata": {
    "address": "XYdpvyWpYwxPWNLSMdUYE9H6Myqprc3TahdvRYkBVe7"
  }
}