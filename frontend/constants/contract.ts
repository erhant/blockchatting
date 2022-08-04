/// do not edit here, go to contracts folder!
import { BigNumber } from "ethers"
import { parseEther } from "ethers/lib/utils"

const contractConstants: Readonly<{
  Chat: {
    contractName: string
    entryFee: BigNumber
    aliasFee: BigNumber
  }
}> = {
  Chat: {
    contractName: "Chat",
    entryFee: parseEther("0.001"),
    aliasFee: parseEther("0.0075"),
  },
}

export default contractConstants
