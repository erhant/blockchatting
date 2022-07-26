import { ethers } from "hardhat"
import chai, { should } from "chai"
import chaiAsPromised from "chai-as-promised"
//@ts-ignore // the objects here are created by typechain
import { Chat__factory, Chat } from "../../frontend/types/typechain"
import { BigNumber, Signer, Wallet } from "ethers"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import contractConstants from "../../frontend/constants/contractConstants"
import { expectEvent } from "../utilities/testing"

chai.use(chaiAsPromised)
const { expect } = chai

describe(contractConstants.Chat.contractName, function() {
  let chatContract: Chat

  // signers
  let owner: SignerWithAddress
  let alice: Wallet
  let bob: Wallet
  let addrs: SignerWithAddress[]

  // deploy the contract before each test
  beforeEach(async function() {
    const factory = ((await ethers.getContractFactory(contractConstants.Chat.contractName)) as unknown) as Chat__factory
    ;[owner, ...addrs] = await ethers.getSigners()
    chatContract = await factory.deploy()
    await chatContract.deployed()
  })
})
