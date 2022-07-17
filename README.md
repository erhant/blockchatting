# Blockchattin

**A decentralized chatting application where each message is a transaction**.

Obviously made for educational purposes, the gas fees are too high and notably unreasonable to be used for chatting. It uses the Rinkeby test network. Note that the messages themselves can be read in the transaction details on etherscan.

Contract address: [0x2304BBd56A0fBCBDb417522fA8fB2EAdCf64E3E4](https://rinkeby.etherscan.io/address/0x2304BBd56A0fBCBDb417522fA8fB2EAdCf64E3E4)

- [x] **Entry Fee**: A small entry-fee (0.001 ETH) must be paid to enter the application.
- [x] **Messaging**: You can send a message to anyone by giving their wallet address. Likewise, you can receive messages to your wallet address. Chatting is one-to-one only, no group messaging or multicasting. Note that you are literally making a transaction for each message, it is gonna cost some money. Thankfully though this is deployed in a test network and this is done for educational purposes.
- [x] **Aliases**: For better UX, you can give yourself an alias to be shown instead of your wallet address. You can change this alias or delete it anytime.
- [x] **Secrecy**: You can specify a secret phrase on client-side to encrypt your messages. The recipient should also know this and must give the same phrase to decrypt the messages. Uses [AES-256](https://www.npmjs.com/package/aes256). Note that changing the password at a later time means older messages will not be read. All messages are encrypted with a default key regardless so that at least it is slighlty harder to read them, at least not directly on the block explorer.

## To-Do

- [ ] There is a bug with removing event listeners on unmount.

## Future Work

As a future to-do, I plan on doing the messaging in a better way.

- Let `p` be the public key of the recipient.
- Let `s` be the private key of the sender (you).
- When sending a message `m`, we could do `m' = enc(m, p) || enc(m, s)`.

This way, the messages that are online and visible will be encrypted, and only the sender and receiver can read them. The sender is doing symmetric encryption (the second half of the message) and the receiver is doing asymmetric encryption (first half of the message). This feature will be implemented once we have API to access the said keys via accounts.
