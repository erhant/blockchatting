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

  // deploy the contract once
  before(async function() {
    const factory = ((await ethers.getContractFactory(contractConstants.Chat.contractName)) as unknown) as Chat__factory
    ;[owner, alice, bob, ...addrs] = await ethers.getSigners()
    chatContract = await factory.deploy()
    await chatContract.deployed()
  })

  describe("aliasing", function() {
    it("owner should be able to change alias fee", async function() {
      const fee = parseEther("1.23") // ether
      await chatContract.connect(owner).changeAliasBaseFee(fee)
      expect((await chatContract.aliasFee()).eq(fee)).to.be.true
    })
  })

  describe("messaging", function() {
    // We cant test metamask rpc with hardhat, hardhat's provider does not support
    // eth_getEncryptionPublicKey and eth_decrypt; so we assume secret key is retrieved
    let aliceSecret: Buffer
    let bobSecret: Buffer

    before(async function() {
      // Alice generates her keys
      aliceSecret = CryptoChat.generateSecret()
      const alicePubkey = Buffer.from(new CryptoChat(aliceSecret).getPublicKey(), "hex")

      await chatContract.connect(alice).initialize(
        aliceSecret.toJSON().data, // this is supposed to be encrypted, but we dont do it in the test
        alicePubkey.slice(1).toJSON().data, // 32 bytes
        alicePubkey.at(0) == 2 // prefix
      )

      // // Bob generates his keys
      bobSecret = CryptoChat.generateSecret()
      const bobPubkey = Buffer.from(new CryptoChat(bobSecret).getPublicKey(), "hex")
      //console.log("KEY BEFORE", bobPubkey.toString("hex"))

      await chatContract.connect(bob).initialize(
        bobSecret.toJSON().data, // this is supposed to be encrypted, but we dont do it in the test
        bobPubkey.slice(1).toJSON().data, // 32 bytes
        bobPubkey.at(0) == 2 // prefix
      )
      //console.log("BOB BEFORE", bobPubkey.at(0) == 2, bobPubkey.slice(1).toString("hex"))
    })

    it("should encrypt & decrypt correctly", async function() {
      const message = randomBytes(32)

      // alice will send the message to bob
      // so she gets his public key first
      let [bobPubkeyPrefix, bobPubkeyX] = await Promise.all([
        chatContract.publicKeyPrefix(bob.address),
        chatContract.publicKey(bob.address),
      ])
      const bobPubkey = Buffer.from((bobPubkeyPrefix ? "02" : "03") + bobPubkeyX.slice(2), "hex")

      // now alice will encrypt her message with bobs key
      const ciphertext = CryptoChat.encrypt(bobPubkey.toString("hex"), message)

      // alice sends the encrypted message
      await chatContract.connect(alice).sendMessage(ciphertext.toString("hex"), bob.address)

      // bob will decrypt
      const bobCryptoChat = new CryptoChat(bobSecret)
      const plaintext = bobCryptoChat.decrypt(ciphertext)

      expect(plaintext.equals(message)).to.be.true
    })
  })
})
