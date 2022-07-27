import chai from "chai"
import chaiAsPromised from "chai-as-promised"
import { CryptoLocal } from "../../frontend/api/public-key-crypto"
import { randomBytes } from "crypto"

chai.use(chaiAsPromised)
const { expect } = chai

describe("CryptoLocal tests", function() {
  it("should encrypt correctly", function() {
    const crypto: CryptoLocal = new CryptoLocal()
    const plaintext = Buffer.from("hey hey there.")
    const ciphertext = crypto.encrypt(crypto.getPublicKey(), plaintext)
    expect(plaintext.equals(ciphertext)).to.be.not.true
  })

  it("should decrypt correctly", function() {
    const crypto: CryptoLocal = new CryptoLocal()
    const plaintext = Buffer.from("hey hey there.")
    const ciphertext = crypto.encrypt(crypto.getPublicKey(), plaintext)

    const plaintext2 = crypto.decrypt(ciphertext)
    expect(plaintext.equals(plaintext2)).to.be.true
  })

  it("should generate same keypair for the same secret", function() {
    const secret = randomBytes(32)
    const crypto1: CryptoLocal = new CryptoLocal(secret)
    const crypto2: CryptoLocal = new CryptoLocal(secret)

    // encrypt with the first CryptoLocal
    const plaintext = Buffer.from("hey hey there.")
    const ciphertext = crypto1.encrypt(crypto1.getPublicKey(), plaintext)

    // decrypt with the second CryptoLocal
    const plaintext2 = crypto2.decrypt(ciphertext)
    expect(plaintext.equals(plaintext2)).to.be.true
  })
})
