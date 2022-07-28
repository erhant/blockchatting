/**
 * See https://betterprogramming.pub/exchanging-encrypted-data-on-blockchain-using-metamask-a2e65a9a896c
 * See https://whyboobo.com/devops/tutorials/asymmetric-encryption-with-nodejs
 * See https://ecies.org/js/
 * See https://davidederosa.com/basic-blockchain-programming/elliptic-curve-keys/
 */
import { randomBytes } from "crypto"
import { encrypt as encryptMM } from "@metamask/eth-sig-util"
import { encrypt as encryptEC, decrypt as decryptEC, PrivateKey } from "eciesjs"
const ascii85 = require("ascii85")

/**
 * A utility class that uses MetaMask RPC api to use public key cryptography of your EOA.
 */
export class CryptoEOA {
  private SCHEME_VERSION: Readonly<string> = "x25519-xsalsa20-poly1305"
  private ACCOUNT: Readonly<string> = ""
  private RPC: any

  constructor(account: string, rpc: any) {
    this.ACCOUNT = account
    this.RPC = rpc // e.g. window.ethereum or network.provider
  }

  /**
   * Wrapper for `encrypt`, converts the string to buffer with utf-8 format
   */
  async encryptString(str: string): Promise<Buffer> {
    return this.encrypt(Buffer.from(str, "utf-8"))
  }

  /**
   * Encrypts a given data with the public key of EOA.
   */
  async encrypt(data: Buffer): Promise<Buffer> {
    // Public Key
    //@ts-ignore
    const keyB64: string = (await this.RPC.request({
      method: "eth_getEncryptionPublicKey",
      params: [this.ACCOUNT],
    })) as string
    const publicKey = Buffer.from(keyB64, "base64")

    // Returned object contains 4 properties: version, ephemPublicKey, nonce, ciphertext
    // Each contains data encoded using base64, version is always the same string
    const enc = encryptMM({
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
  async decrypt(data: Buffer): Promise<Buffer> {
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

    //@ts-ignore
    const decrypt = await this.RPC.request({
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
export class CryptoChat {
  private sk: PrivateKey

  static generateSecret(): Buffer {
    return randomBytes(32)
  }

  static encrypt(publicKey: string, data: Buffer): Buffer {
    return encryptEC(publicKey, data)
  }

  constructor(secret: Buffer) {
    this.sk = new PrivateKey(secret)
  }

  decrypt(data: Buffer): Buffer {
    return decryptEC(this.sk.toHex(), data)
  }

  encrypt(data: Buffer): Buffer {
    return CryptoChat.encrypt(this.getPublicKey(), data)
  }

  getPublicKey(): string {
    return this.sk.publicKey.toHex()
  }
}
