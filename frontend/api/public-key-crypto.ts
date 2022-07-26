/**
 * See https://betterprogramming.pub/exchanging-encrypted-data-on-blockchain-using-metamask-a2e65a9a896c
 * See https://whyboobo.com/devops/tutorials/asymmetric-encryption-with-nodejs
 * See https://ecies.org/js/
 */
import { randomBytes } from "crypto"
import secp256k1 from "secp256k1"
import { encrypt } from "@metamask/eth-sig-util"
const ascii85 = require("ascii85")

/**
 * A utility class that uses MetaMask RPC api to use public key cryptography of your EOA.
 */
export class CryptoMetamask {
  SCHEME_VERSION: Readonly<string> = "x25519-xsalsa20-poly1305"
  ACCOUNT: Readonly<string> = ""

  constructor(account: string) {
    this.ACCOUNT = account
  }

  /**
   * Encrypts a given data with the public key of EOA.
   */
  async encryptEOA(data: Buffer): Promise<Buffer> {
    // Public Key
    const keyB64: string = (await window.ethereum.request({
      method: "eth_getEncryptionPublicKey",
      params: [this.ACCOUNT],
    })) as string
    const publicKey = Buffer.from(keyB64, "base64")

    // Returned object contains 4 properties: version, ephemPublicKey, nonce, ciphertext
    // Each contains data encoded using base64, version is always the same string
    const enc = encrypt({
      publicKey: publicKey.toString("base64"),
      data: ascii85.encode(data).toString(),
      version: this.SCHEME_VERSION,
    })

    // We want to store the data in smart contract, therefore we concatenate them
    // into single Buffer
    const buf = Buffer.concat([
      Buffer.from(enc.ephemPublicKey, "base64"),
      Buffer.from(enc.nonce, "base64"),
      Buffer.from(enc.ciphertext, "base64"),
    ])

    // In smart contract we are using `bytes[112]` variable (fixed size byte array)
    // you might need to use `bytes` type for dynamic sized array
    // We are also using ethers.js which requires type `number[]` when passing data
    // for argument of type `bytes` to the smart contract function
    // Next line just converts the buffer to `number[]` required by contract function
    // THIS LINE IS USED IN OUR ORIGINAL CODE:
    // return buf.toJSON().data;

    // Return just the Buffer to make the function directly compatible with decryptData function
    return buf
  }

  /**
   * Decrypts a given data with the private key of EOA.
   */
  async decryptEOA(data: Buffer): Promise<Buffer> {
    // Reconstructing the original object outputed by encryption
    const structuredData = {
      version: this.SCHEME_VERSION,
      ephemPublicKey: data.slice(0, 32).toString("base64"),
      nonce: data.slice(32, 56).toString("base64"),
      ciphertext: data.slice(56).toString("base64"),
    }
    // Convert data to hex string required by MetaMask
    const ct = `0x${Buffer.from(JSON.stringify(structuredData), "utf8").toString("hex")}`
    // Send request to MetaMask to decrypt the ciphertext
    // Once again application must have acces to the account
    const decrypt = await window.ethereum.request({
      method: "eth_decrypt",
      params: [ct, this.ACCOUNT],
    })
    // Decode the base85 to final bytes
    return ascii85.decode(decrypt)
  }
}

/**
 * A utility class that uses your local public and private keys. If no key is provided to the constructor, a new one is generated.
 */
export class CryptoLocal {}
