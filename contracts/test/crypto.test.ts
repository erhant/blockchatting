import {expect} from 'chai';
import {CryptoECIES, generateSecret} from '../lib/crypto';

describe('CryptoECIES tests', async () => {
  it('should encrypt correctly', async () => {
    const crypto: CryptoECIES = new CryptoECIES(generateSecret());
    const plaintext = Buffer.from('hey hey there.');
    const ciphertext = crypto.encrypt(plaintext);

    // console.log(crypto.getPublicKey().length)
    // console.log(Buffer.from(crypto.getPublicKey(), "hex"))
    // console.log(Buffer.from(crypto.getPublicKey(), "hex").byteLength)
    // console.log(Buffer.from(crypto.getPublicKey(), "hex").length)
    // console.log(Buffer.from(crypto.getPublicKey(), "hex").toJSON().data)
    // console.log(Buffer.from(crypto.getPublicKey(), "hex").toJSON().data.length)
    expect(plaintext.equals(ciphertext)).to.be.not.true;
  });

  it('should decrypt correctly', async () => {
    const crypto: CryptoECIES = new CryptoECIES(generateSecret());
    const plaintext = Buffer.from('hey hey there.');
    const ciphertext = crypto.encrypt(plaintext);

    const plaintext2 = crypto.decrypt(ciphertext);
    expect(plaintext.equals(plaintext2)).to.be.true;
  });

  it('should generate same keypair for the same secret', async () => {
    const secret = generateSecret();
    const crypto1: CryptoECIES = new CryptoECIES(secret);
    const crypto2: CryptoECIES = new CryptoECIES(secret);

    // encrypt with the first CryptoECIES
    const plaintext = Buffer.from('hey hey there.');
    const ciphertext = crypto1.encrypt(plaintext);

    // decrypt with the second CryptoECIES
    const plaintext2 = crypto2.decrypt(ciphertext);
    expect(plaintext.equals(plaintext2)).to.be.true;
  });
});
