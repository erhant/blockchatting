import { ethers, network } from "hardhat"
import chai, { should } from "chai"
import chaiAsPromised from "chai-as-promised"
//@ts-ignore // the objects here are created by typechain
import { Chat__factory, Chat } from "../../frontend/types/typechain"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import contractConstants from "../../frontend/constants/contractConstants"
import { expectEvent } from "../utilities/testing"
import { CryptoChat, CryptoEOA } from "../../frontend/api/public-key-crypto"
import { randomBytes } from "crypto"
import { formatEther, parseEther } from "ethers/lib/utils"

chai.use(chaiAsPromised)
const { expect } = chai

describe(contractConstants.Chat.contractName, function() {
  let chatContract: Chat

  // signers
  let owner: SignerWithAddress
  let alice: SignerWithAddress
  let bob: SignerWithAddress
  let addrs: SignerWithAddress[]

  // deploy the contract before each test
  beforeEach(async function() {
    const factory = ((await ethers.getContractFactory(contractConstants.Chat.contractName)) as unknown) as Chat__factory
    ;[owner, alice, bob, ...addrs] = await ethers.getSigners()
    chatContract = await factory.deploy()
    await chatContract.deployed()
  })

  describe("aliasing", function() {
    it("owner should be able to change alias fee", async function() {
      const fee = "1.23" // ether
      await chatContract.connect(owner).changeAliasBaseFee(parseEther(fee))
      expect((await chatContract.aliasFee()).eq(fee)).to.be.true
    })
  })

  describe("messaging", function() {
    before(async function() {
      // Alice generates her keys
      const aliceSecret = CryptoChat.generateSecret()
      const alicePubkey = new CryptoChat(aliceSecret).getPublicKey()
      const alicePubkeyBuffer = Buffer.from(alicePubkey, "hex")
      const aliceSecretEnc = await new CryptoEOA(alice.address, network.provider).encrypt(aliceSecret)
      await chatContract.initialize(aliceSecretEnc, alicePubkeyBuffer.slice(1), alicePubkeyBuffer.at(0) == 2)

      // Bob generates his keys
      const bobSecret = CryptoChat.generateSecret()
      const bobPubkey = new CryptoChat(bobSecret).getPublicKey()
      const bobPubkeyBuffer = Buffer.from(bobPubkey, "hex")
      const bobSecretEnc = new CryptoEOA(bob.address, network.provider).encrypt(bobSecret)
      await chatContract.initialize(bobSecretEnc, alicePubkeyBuffer.slice(1), alicePubkeyBuffer.at(0) == 2)
    })
  })
})
