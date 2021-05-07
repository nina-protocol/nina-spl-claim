Introducing the Nina Spl-Claim Program

A Proof of Concept for a Tokenized Access-Control Mechanism

Are you still using spreadsheets, Google Forms, DMs, passwords, and access codes to grant early/closed testing access to users?

Why?

A blockchain is a distributed ledger - it is no longer necessary to rely on legacy accounting practices to keep track of who has a right of access or who made a claim before someone else. 

This can all be represented by simply holding a completely arbitrary token. A token that has no value or purpose other than representing a spot in line - a key to a protected area.  Since Solana is so fast and cheap there is basically 0 overhead to using tokens this way.

The Nina Spl-Claim Program streamlines the process for a developer to mint an arbitrary amount of tokens, at arbitrary times, that can provide access to a closed beta test.  

A developer using the program creates a faucet, fills it when they want to provide more access, burns it when the want to close access.  Their users can then claim a token (one per wallet) - which grants them access to the closed beta test.  This takes the accounting burden off the developers, while the users can rest assured that access was given out in a first-come-first-served manner (though they will probably still think that bots took all the tokens).  Perhaps users will create secondary markets for these Claim-Token invites.  Perhaps people will use this to keep account of who is eligible for airdrops (paired with the Solana Name Service https://spl.solana.com/name-service to ensure claims cannot be made by bots) - you can't really tell what people will do with a new technology.


To create a faucet:
`node client/initialize.js`

[Take note of the Faucet Program Address printed out on initialization.  You will need to set `FAUCET_ACCOUNT` in `/app/src/utils/faucet.js` and `/client/faucet.js`to this value as well .]

To fill the faucet:
`node client/refillFaucet.js`

To burn unclaimed supply:
`node client/burn.js`

A basic ReactJS frontend is provided in `/app` - in this example only holders of the Claim-Token for this app have access to `/app/src/components/ProtectedArea.js`

Built using the Anchor framework: https://github.com/project-serum/anchor

Currently live on devnet at: https://explorer.solana.com/address/FMuM2X5T4sju5zE6NHexuYyHX2WjL5qZmwSSYq4WdGKK?cluster=devnet