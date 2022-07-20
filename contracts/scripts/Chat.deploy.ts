import { ethers } from "hardhat"
//@ts-ignore // the objects here are created by typechain
import { Chat__factory, Chat } from "../../frontend/types/typechain"
import contractConstants from "../../frontend/constants/contractConstants"

export default async function main(): Promise<string> {
  console.log(`\n[${contractConstants.Chat.contractName} Contract]`)
  const factory = (await ethers.getContractFactory(contractConstants.Chat.contractName)) as Chat__factory

  let contract = (await factory.deploy()) as Chat
  console.log(`\tDeploying... (tx: ${contract.deployTransaction.hash})`)
  await contract.deployed()

  // remove last line
  process.stdout.moveCursor(0, -1)
  process.stdout.clearLine(1)
  console.log(`\tContract is deployed at ${contract.address}`)
  return contract.address
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}
