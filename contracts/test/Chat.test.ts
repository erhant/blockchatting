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

    before(async function() {
      // Alice generates her keys
      const aliceSecret = CryptoChat.generateSecret()
      const alicePubkey = Buffer.from(new CryptoChat(aliceSecret).getPublicKey(), "hex")

      await chatContract.connect(alice).initialize(
        aliceSecret.toJSON().data, // this is supposed to be encrypted, but we dont do it in the test
        alicePubkey.at(0) == 2, // prefix
        alicePubkey.slice(1).toJSON().data // 32 bytes
      )

      // // Bob generates his keys
      const bobSecret = CryptoChat.generateSecret()
      const bobPubkey = Buffer.from(new CryptoChat(bobSecret).getPublicKey(), "hex")
      //console.log("KEY BEFORE", bobPubkey.toString("hex"))

      await chatContract.connect(bob).initialize(
        bobSecret.toJSON().data, // this is supposed to be encrypted, but we dont do it in the test
        bobPubkey.at(0) == 2, // prefix
        bobPubkey.slice(1).toJSON().data // 32 bytes
      )
      console.log("BOB SEC 1:", bobSecret.toString("hex"))
      //console.log("BOB BEFORE", bobPubkey.at(0) == 2, bobPubkey.slice(1).toString("hex"))
    })

    it("should encrypt & decrypt correctly", async function() {
      const message = randomBytes(32)

      const bobInitEvent = (await chatContract.queryFilter(chatContract.filters.UserInitialized(bob.address)))[0].args

      // alice will send the message to bob
      // so she gets his public key first
      let [bobPubkeyPrefix, bobPubkeyX, bobSecretHex] = [
        bobInitEvent._pubKeyPrefix ? "02" : "03",
        bobInitEvent._pubKeyX.slice(2), // omit 0x
        bobInitEvent._encSecret.slice(2), // omit 0x
      ]

      console.log("BOB SEC 2:", bobSecretHex)
      const bobPubkey = Buffer.from(bobPubkeyPrefix + bobPubkeyX, "hex")

      // now alice will encrypt her message with bobs key
      const ciphertext = CryptoChat.encrypt(bobPubkey.toString("hex"), message)

      // alice sends the encrypted message
      const tx = await chatContract.connect(alice).sendMessage(ciphertext.toString("hex"), bob.address)
      expectEvent(await tx.wait(), "MessageSent", r => {
        let [_from, _to, _message] = [r._from, r._to, r._message]
        expect(_from).eq(alice.address)
        expect(_to).eq(bob.address)

        // bob will decrypt
        const ciphertext = Buffer.from(_message, "hex")
        const bobCryptoChat = new CryptoChat(Buffer.from(bobSecretHex, "hex"))
        const plaintext = bobCryptoChat.decrypt(ciphertext)
        expect(plaintext.equals(message)).to.be.true
        return true
      })
    })
  })
})
