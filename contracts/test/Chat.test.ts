import {ethers, network} from 'hardhat';
import {expect} from 'chai';
//@ts-ignore // the objects here are created by typechain
import {Chat__factory, Chat} from '../types/typechain';
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers';
import contractConstants from '../constants';
import {CryptoChat, CryptoEOA} from '../lib/crypto';
import {randomBytes} from 'crypto';
import {formatEther, parseEther} from 'ethers/lib/utils';
import {BigNumber, ContractTransaction} from 'ethers';

describe('Chat', async () => {
  let contract: Chat;

  // signers
  let owner: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;
  let addrs: SignerWithAddress[];

  // deploy the contract once
  before(async () => {
    const factory = (await ethers.getContractFactory('Chat')) as unknown as Chat__factory;
    [owner, alice, bob, ...addrs] = await ethers.getSigners();
    contract = await factory.deploy();
    await contract.deployed();
  });

  describe('deployment', async () => {
    it('should have owner as owner', async () => {
      expect(await contract.owner()).to.eq(owner.address);
    });

    it('should have alice and bob uninitialized', async () => {
      expect(await contract.isInitialized(alice.address)).to.eq(false);
      expect(await contract.isInitialized(bob.address)).to.eq(false);
    });
  });

  describe('initializations', async () => {
    before(async () => {
      // Alice generates her keys
      const aliceSecret = CryptoChat.generateSecret();
      const alicePubkey = Buffer.from(new CryptoChat(aliceSecret).getPublicKey(), 'hex');

      await contract.connect(alice).initializeUser(
        aliceSecret.toJSON().data, // this is supposed to be encrypted, but we dont do it in the test
        alicePubkey[0] == 2, // prefix
        alicePubkey.slice(1).toJSON().data // 32 bytes
      );

      // // Bob generates his keys
      const bobSecret = CryptoChat.generateSecret();
      const bobPubkey = Buffer.from(new CryptoChat(bobSecret).getPublicKey(), 'hex');

      await contract.connect(bob).initializeUser(
        bobSecret.toJSON().data, // this is supposed to be encrypted, but we dont do it in the test
        bobPubkey[0] == 2, // prefix
        bobPubkey.slice(1).toJSON().data // 32 bytes
      );

      expect(await contract.isInitialized(alice.address)).to.be.true;
      expect(await contract.isInitialized(bob.address)).to.be.true;
    });

    it('should encrypt & decrypt correctly', async () => {
      // alice will send some message to bob
      const message = Buffer.from('Hey there mate!');

      // she creates a random private key to chat with bob
      const secret = randomBytes(32);

      // alice get bob's public key and encrypts the secret
      const bobInit = await contract.connect(alice).userInitializations(bob.address);
      const [bobSecretHex, bobPubkeyPrefix, bobPubkeyX] = [
        bobInit[0].slice(2), // omit 0x
        bobInit[1] ? '02' : '03', // boolean to prefix
        bobInit[2].slice(2), // omit 0x
      ];
      const bobPubkey = Buffer.from(bobPubkeyPrefix + bobPubkeyX, 'hex');
      const secretEncryptedForBob = CryptoChat.encrypt(bobPubkey.toString('hex'), secret);

      // she also does the same for herself
      const aliceInit = await contract.connect(alice).userInitializations(alice.address);
      const [aliceSecretHex, alicePubkeyPrefix, alicePubkeyX] = [
        aliceInit[0].slice(2), // omit 0x
        aliceInit[1] ? '02' : '03', // boolean to prefix
        aliceInit[2].slice(2), // omit 0x
      ];

      const alicePubkey = Buffer.from(alicePubkeyPrefix + alicePubkeyX, 'hex');
      const secretEncryptedForAlice = CryptoChat.encrypt(alicePubkey.toString('hex'), secret);
      console.log('SECRET  :', secret, secret.length);
      console.log('SECRET A:', secretEncryptedForAlice, secretEncryptedForAlice.length);
      console.log('SECRET B:', secretEncryptedForBob, secretEncryptedForBob.length);

      // alice initializes the chat with bob
      await contract.connect(alice).initializeChat(secretEncryptedForAlice, secretEncryptedForBob, bob.address);

      // alice encrypts the message with secret
      const aliceCryptoChat = new CryptoChat(secret);
      const ciphertext = aliceCryptoChat.encrypt(message);
      const ciphertextArg = ciphertext.toString('hex');

      // alice sends encrypted messsage to bob
      await expect(contract.connect(alice).sendMessage(ciphertextArg, bob.address)).to.emit(contract, 'MessageSent');
      // .withArgs(alice.address, bob.address, async (ciphertext: any) => {
      //   // TODO
      // });

      // bob fetches the common secret used in this chat
      const commonSecretEnc = await contract.chatInitializations(bob.address, alice.address);
      const bobCryptoChat = new CryptoChat(Buffer.from(bobSecretHex, 'hex'));
      const commonSecret = bobCryptoChat.decrypt(Buffer.from(commonSecretEnc.slice(2), 'hex'));

      // bob decrypts the message by creating the key pair with his secret
      const bobAliceCryptoChat = new CryptoChat(commonSecret);
      const plaintext = bobAliceCryptoChat.decrypt(Buffer.from(ciphertextArg, 'hex'));
      console.log('TEXT: ', plaintext);
      //expect(plaintext.equals(message)).to.be.true;
    });
  });
});
