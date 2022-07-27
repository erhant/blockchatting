import chai from "chai"
import chaiAsPromised from "chai-as-promised"
import { CryptoChat } from "../../frontend/api/public-key-crypto"
import { randomBytes } from "crypto"

chai.use(chaiAsPromised)
const { expect } = chai

describe("CryptoChat tests", function() {
  it("should encrypt correctly", function() {
    const crypto: CryptoChat = new CryptoChat(CryptoChat.generateSecret())
    const plaintext = Buffer.from("hey hey there.")
    const ciphertext = crypto.encrypt(crypto.getPublicKey(), plaintext)

    console.log(crypto.getPublicKey().length)
    console.log(Buffer.from(crypto.getPublicKey(), "hex"))
    console.log(Buffer.from(crypto.getPublicKey(), "hex").byteLength)
    console.log(Buffer.from(crypto.getPublicKey(), "hex").length)
    console.log(Buffer.from(crypto.getPublicKey(), "hex").toJSON().data)
    console.log(Buffer.from(crypto.getPublicKey(), "hex").toJSON().data.length)
    expect(plaintext.equals(ciphertext)).to.be.not.true
  })

  it("should decrypt correctly", function() {
    const crypto: CryptoChat = new CryptoChat(CryptoChat.generateSecret())
    const plaintext = Buffer.from("hey hey there.")
    const ciphertext = crypto.encrypt(crypto.getPublicKey(), plaintext)

    const plaintext2 = crypto.decrypt(ciphertext)
    expect(plaintext.equals(plaintext2)).to.be.true
  })

  it("should generate same keypair for the same secret", function() {
    const secret = CryptoChat.generateSecret()
    const crypto1: CryptoChat = new CryptoChat(secret)
    const crypto2: CryptoChat = new CryptoChat(secret)

    // encrypt with the first CryptoChat
    const plaintext = Buffer.from("hey hey there.")
    const ciphertext = crypto1.encrypt(crypto1.getPublicKey(), plaintext)

    // decrypt with the second CryptoChat
    const plaintext2 = crypto2.decrypt(ciphertext)
    expect(plaintext.equals(plaintext2)).to.be.true
  })
})
