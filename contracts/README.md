# Contracts

I have modified the starter kit of [rhlsthrm](https://github.com/rhlsthrm/typescript-solidity-dev-starter-kit) for my project. See the original [README](./LEGACY.md).

1. Write your contract under [contracts](./contracts/).
2. Compile it via `npx hardhat compile`.
3. Test the contract using `npx hardhat test`.
4. Deploy the compiled contract.
   - Use `npx hardhat run ./scripts/<contract name>.deploy.ts`.
   - Or start local network via `npx hardhat node` and then deploy with `npx hardhat run ./scripts/<contract name>.deploy.ts --network localhost` ([see more](https://hardhat.org/getting-started/#connecting-a-wallet-or-dapp-to-hardhat-network))
   - Alternatively, run the [deployment shell script](./batches/deployAll.sh) with network name as the parameter (defaults to `localhost`) to run all scripts with name `*.deploy.ts`.
5. It is now ready to be used on the frontend!

Deploy scripts are named as `<contract name>.deploy.ts`, and if some script depends on the deployment of another script (where the address is used) each deploy script exports a function that returns the contract address as a Promise. To deploy on actual networks, you will need to provide keys and projectIDs in an `.env` file, for example:

```env
# Rinkeby
RINKEBY_PRIVATE_KEY=<your private key>
RINKEBY_INFURA_PROJECT_ID=<project id>
```
