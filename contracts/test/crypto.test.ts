import {expect} from 'chai';
import {CryptoAES256, CryptoECIES, generateSecret} from '../lib/crypto';

describe('Crypto tests', () => {
  describe('ECIES', () => {
    let secret: Buffer;
    let cryptoScheme: CryptoECIES;
    let plaintext: Buffer;

    before(() => {
      secret = generateSecret();
      plaintext = generateSecret(); // also generate a random message
      cryptoScheme = new CryptoECIES(secret);
    });

    it('should encrypt & decrypt correctly', async () => {
      const ciphertext = cryptoScheme.encrypt(plaintext);
      expect(plaintext.equals(ciphertext)).to.be.not.true;
      const plaintext2 = cryptoScheme.decrypt(ciphertext);
      expect(plaintext.equals(plaintext2)).to.be.true;
    });

    it('should generate same keypair for the same secret', async () => {
      const newCryptoScheme = new CryptoECIES(secret);
      const ciphertext = cryptoScheme.encrypt(plaintext);
      const plaintext2 = newCryptoScheme.decrypt(ciphertext);
      expect(plaintext.equals(plaintext2)).to.be.true;
    });
  });

  describe('AES256', () => {
    let key: Buffer;
    let cryptoScheme: CryptoAES256;
    let plaintext: Buffer;

    before(() => {
      key = generateSecret();
      plaintext = generateSecret(); // also generate a random message
      cryptoScheme = new CryptoAES256(key);
    });

    it('should encrypt & decrypt correctly', async () => {
      const ciphertext = cryptoScheme.encrypt(plaintext);
      expect(plaintext.equals(ciphertext)).to.be.not.true;
      const plaintext2 = cryptoScheme.decrypt(ciphertext);
      expect(plaintext.equals(plaintext2)).to.be.true;
    });
  });
});
