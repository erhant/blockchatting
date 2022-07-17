# NextJS + Web3 Starter

This repository has both the frontend, and the contracts; both sides are using TypeScript.

- [Frontend](./frontend/) is using NextJS. It uses MantineUI, but also supports SASS for further styling.
- [Contracts](./contracts/) is using HardHat. TypeChain is used to generate interfaces for the contracts.

## Usage

Here is the workflow you should follow for **development**:

1. Write your contract, compile it with `npx hardhat compile`.
2. On a separate terminal, start a node with `npx hardhat node`.
3. Deploy the compiled contract to your localhost with `npx hardhat run ./scripts/<your script> --network localhost`.
4. Write the contract address in your frontend code, and run the app with `npm run dev`.
5. You are ready to interact with the contract!

To connect the localhost from MetaMask, change the chainId of localhost to be `31337`. You can then import one of the public accounts (with known private keys) to your MetaMask, and interact with the contract using the ETH there. If you get internal errors from MetaMask (such as _different block number_ or _nonce too high_) reset your account from `Settings > Advanced > Reset Account`. This will make your injected wallet use local hardhat information instead of the cached one from your previous session.

## Examples

- A Counter [contract](./contracts/contracts/Counter.sol) is provided together with it's interactive [page](./frontend/pages/counter.tsx).
- A ERC-20 token [contract](./contracts/contracts/MyToken.sol) is provided together with it's interactive [page](./frontend/pages/mytoken.tsx).

These are also deployed on Rinkeby testnet: [Counter](https://rinkeby.etherscan.io/address/0x7C9f4AA2fe39c7F5E9E18626D2CDF577af12a47D) and [MyToken](https://rinkeby.etherscan.io/address/0x1B7D3ea00f8e8142A5DFba8F95ceA8048eBC1bEC).

## Deployment

Project is deployed via Vercel CLI from the root directory with `vercel .`. In the project settings, the root directory is shown to be `frontend` and the preset settings are set for NextJS. I prefer this as otherwise Typechain generated files wont be visible there, and if you try to compile stuff with Hardhat you will get an error for trying to use Hardhat non-locally.
