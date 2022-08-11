import { ethers, network } from "hardhat"
import chai, { should } from "chai"
import chaiAsPromised from "chai-as-promised"
//@ts-ignore // the objects here are created by typechain
import { Chat__factory, Chat } from "../types/typechain"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import contractConstants from "../constants/contract"
import { expectEvent } from "../utilities/testing"
import { CryptoChat, CryptoEOA } from "../../frontend/api/public-key-crypto"
import { randomBytes } from "crypto"
import { formatEther, parseEther } from "ethers/lib/utils"
import { BigNumber, ContractTransaction } from "ethers"

chai.use(chaiAsPromised)
const { expect } = chai

describe(contractConstants.Chat.contractName, function() {
  let chatContract: Chat
  let tx: ContractTransaction

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

    // Alice generates her keys
    const aliceSecret = CryptoChat.generateSecret()
    const alicePubkey = Buffer.from(new CryptoChat(aliceSecret).getPublicKey(), "hex")

    tx = await chatContract.connect(alice).initialize(
      aliceSecret.toJSON().data, // this is supposed to be encrypted, but we dont do it in the test
      alicePubkey.at(0) == 2, // prefix
      alicePubkey.slice(1).toJSON().data // 32 bytes
    )

    // // Bob generates his keys
    const bobSecret = CryptoChat.generateSecret()
    const bobPubkey = Buffer.from(new CryptoChat(bobSecret).getPublicKey(), "hex")

    await chatContract.connect(bob).initialize(
      bobSecret.toJSON().data, // this is supposed to be encrypted, but we dont do it in the test
      bobPubkey.at(0) == 2, // prefix
      bobPubkey.slice(1).toJSON().data // 32 bytes
    )
  })

  describe("deployment", function() {
    it("should have alice and bob initialized", async function() {
      expect(await chatContract.isInitialized(alice.address)).to.be.true
      expect(await chatContract.isInitialized(bob.address)).to.be.true
    })

    it("should have owner as owner", async function() {
      expect(await chatContract.owner()).to.eq(owner.address)
    })
  })

  describe("aliasing", function() {
    const alias = "Hello there"
    const aliasBytes = ethers.utils.zeroPad(Buffer.from(alias), 32)

    it("should allow alice to buy an alias", async function() {
      const fee = await chatContract.aliasFee()
      await chatContract.connect(alice).purchaseAlias(aliasBytes, { value: fee })
      let [aliasOwner, aliasPrice, addressAlias] = await Promise.all([
        chatContract.aliasToAddress(aliasBytes),
        chatContract.aliasPrice(aliasBytes),
        chatContract.addressToAlias(alice.address),
      ])
      expect(aliasOwner).eq(alice.address)
      expect(aliasPrice.eq(0)).to.be.true
      expect(Uint8Array.from(Buffer.from(addressAlias.slice(2), "hex"))).to.deep.eq(aliasBytes)
    })

    it("should allow bob to buy alice's alias for higher price", async function() {
      const fee = await chatContract.aliasFee()
      await chatContract.connect(bob).purchaseAlias(aliasBytes, { value: fee.add(parseEther("0.001")) })
      let [aliasOwner, aliasPrice, addressAlias] = await Promise.all([
        chatContract.aliasToAddress(aliasBytes),
        chatContract.aliasPrice(aliasBytes),
        chatContract.addressToAlias(bob.address),
      ])
      expect(aliasOwner).eq(bob.address)
      expect(aliasPrice.eq(parseEther("0.001"))).to.be.true
      expect(Uint8Array.from(Buffer.from(addressAlias.slice(2), "hex"))).to.deep.eq(aliasBytes)
    })

    it("should allow bob to refund", async function() {
      const prev_bobBalance = await bob.getBalance()
      const prev_aliasPrice = await chatContract.aliasPrice(aliasBytes)

      // bob makes a refund
      await chatContract.connect(bob).refundAlias(aliasBytes)
      expect(await chatContract.payments(bob.address)).to.eq(prev_aliasPrice)
      await chatContract.connect(bob).withdrawPayments(bob.address)

      let [aliasOwner, aliasPrice, addressAlias, bobBalance] = await Promise.all([
        chatContract.aliasToAddress(aliasBytes),
        chatContract.aliasPrice(aliasBytes),
        chatContract.addressToAlias(bob.address),
        bob.getBalance(),
      ])
      expect(aliasOwner).eq(ethers.utils.hexZeroPad([], 20))
      expect(aliasPrice.eq(BigNumber.from(0))).to.be.true
      expect(Uint8Array.from(Buffer.from(addressAlias.slice(2), "hex"))).to.deep.eq(
        ethers.utils.zeroPad(Buffer.from(""), 32)
      )
      expect(bobBalance.gt(prev_bobBalance)).to.be.true
    })

    it("should allow owner to change alias fee", async function() {
      const newFee = parseEther("1.23") // ether
      await chatContract.connect(owner).changeAliasBaseFee(newFee)
      expect((await chatContract.aliasFee()).eq(newFee)).to.be.true
    })
  })

  describe("messaging", function() {
    it("should encrypt & decrypt correctly", async function() {
      const message = randomBytes(32)

      // alice and bob both query bob's initialization event
      const bobInitEvent = (await chatContract.queryFilter(chatContract.filters.UserInitialized(bob.address)))[0].args

      // alice will send the message to bob
      // so she encrypts her message with his key
      const [bobPubkeyPrefix, bobPubkeyX, bobSecretHex] = [
        bobInitEvent._pubKeyPrefix ? "02" : "03",
        bobInitEvent._pubKeyX.slice(2), // omit 0x
        bobInitEvent._encSecret.slice(2), // omit 0x
      ]
      const bobPubkey = Buffer.from(bobPubkeyPrefix + bobPubkeyX, "hex")
      const ciphertext = CryptoChat.encrypt(bobPubkey.toString("hex"), message)

      // alice sends the encrypted message
      tx = await chatContract.connect(alice).sendMessage(ciphertext.toString("hex"), bob.address)
      expectEvent(await tx.wait(), "MessageSent", r => {
        let [_from, _to, _message] = [r._from, r._to, r._message]
        expect(_from).eq(alice.address)
        expect(_to).eq(bob.address)

        // bob will decrypt by creating the key pair with his secret
        const ciphertext = Buffer.from(_message, "hex")
        const bobCryptoChat = new CryptoChat(Buffer.from(bobSecretHex, "hex"))
        const plaintext = bobCryptoChat.decrypt(ciphertext)
        expect(plaintext.equals(message)).to.be.true
        return true
      })
    })
  })
})
