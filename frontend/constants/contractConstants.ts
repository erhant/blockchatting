import { BigNumber } from "ethers"
import { parseEther } from "ethers/lib/utils"

const contractConstants: Readonly<{
  MyToken: {
    contractName: string
    tokenName: string
    tokenSymbol: string
    totalSupply: BigNumber
  }
  Counter: {
    contractName: string
  }
}> = {
  MyToken: {
    totalSupply: parseEther("100"),
    contractName: "MyToken",
    tokenName: "MyToken",
    tokenSymbol: "MYTOK",
  },
  Counter: {
    contractName: "Counter",
  },
}

export default contractConstants
