import {ethers} from 'hardhat';
import {expect} from 'chai';
import {Chat__factory, Chat} from '../types/typechain';
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers';
import {CryptoAES256, CryptoECIES, generateSecret} from '../lib/crypto';
import {randomBytes} from 'crypto';
import {BigNumber} from 'ethers';

describe('Chat', async () => {
  let contract: Chat;

  // signers
  let owner: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;

  // deploy the contract once
  before(async () => {
    const factory = (await ethers.getContractFactory('Chat')) as unknown as Chat__factory;
    [owner, alice, bob] = await ethers.getSigners();
    contract = await factory.deploy();
    await contract.deployed();
    expect(await contract.owner()).to.eq(owner.address);
  });

  describe('initializations', async () => {
    let entryFee: BigNumber;
    before(async () => {
      entryFee = await contract.entryFee();
    });

    it('should initialize alice', async () => {
      expect(await contract.isUserInitialized(alice.address)).to.eq(false);

      const aliceSecret = generateSecret();
      const alicePubkey = Buffer.from(new CryptoECIES(aliceSecret).getPublicKey(), 'hex');
      await expect(
        contract.connect(alice).initializeUser(
          aliceSecret.toJSON().data, // this is supposed to be encrypted by MetaMask, but we dont do it in the test
          alicePubkey[0] == 2, // prefix
          alicePubkey.slice(1).toJSON().data, // 32 bytes
          {
            value: entryFee,
          }
        )
      )
        .to.emit(contract, 'UserInitialized')
        .withArgs(alice.address);
    });

    it('should initialize bob', async () => {
      expect(await contract.isUserInitialized(bob.address)).to.eq(false);

      // bob generates a secret
      const bobSecret = generateSecret();
      const bobPubkey = Buffer.from(new CryptoECIES(bobSecret).getPublicKey(), 'hex');
      await expect(
        contract.connect(bob).initializeUser(
          bobSecret.toJSON().data, // this is supposed to be encrypted by MetaMask, but we dont do it in the test
          bobPubkey[0] == 2, // prefix
          bobPubkey.slice(1).toJSON().data, // 32 bytes
          {
            value: entryFee,
          }
        )
      )
        .to.emit(contract, 'UserInitialized')
        .withArgs(bob.address);

      expect(await contract.isUserInitialized(alice.address)).to.be.true;
      expect(await contract.isUserInitialized(bob.address)).to.be.true;
    });

    it('should initialize chat between alice and bob', async () => {
      // chat should be uninitialized at first
      expect(await contract.isChatInitialized(alice.address, bob.address)).to.eq(false);

      // she creates a random key to chat with bob
      const chatSecret = generateSecret();

      // alice get bob's public key and encrypts the secret
      const bobInit = await contract.connect(alice).userInitializations(bob.address);
      const [_, bobPubkeyPrefix, bobPubkeyX] = [
        bobInit[0].slice(2), // omit 0x
        bobInit[1] ? '02' : '03', // boolean to prefix
        bobInit[2].slice(2), // omit 0x
      ];
      const bobPubkey = Buffer.from(bobPubkeyPrefix + bobPubkeyX, 'hex');
      const chatSecretEncryptedForBob = CryptoECIES.encrypt(bobPubkey.toString('hex'), chatSecret);

      // she also does the same for herself
      const aliceInit = await contract.connect(alice).userInitializations(alice.address);
      const [__, alicePubkeyPrefix, alicePubkeyX] = [
        aliceInit[0].slice(2), // omit 0x
        aliceInit[1] ? '02' : '03', // boolean to prefix
        aliceInit[2].slice(2), // omit 0x
      ];

      const alicePubkey = Buffer.from(alicePubkeyPrefix + alicePubkeyX, 'hex');
      const chatSecretEncryptedForAlice = CryptoECIES.encrypt(alicePubkey.toString('hex'), chatSecret);

      // alice initializes the chat with bob
      await expect(
        contract.connect(alice).initializeChat(chatSecretEncryptedForAlice, chatSecretEncryptedForBob, bob.address)
      )
        .to.emit(contract, 'ChatInitialized')
        .withArgs(alice.address, bob.address);

      expect(await contract.isChatInitialized(alice.address, bob.address)).to.eq(true);
    });

    describe('messaging', async () => {
      let message: Buffer;
      before(async () => {
        message = randomBytes(32);
      });

      it('should allow alice to send an encrypted message to bob', async () => {
        // alice gets the encrypted chat secret from chatInitializations
        const chatSecretEncryptedForAlice = Buffer.from(
          (await contract.chatInitializations(alice.address, bob.address)).slice(2),
          'hex'
        );

        // alice gets the encrypted user secret necessary to create the decryptor of the chat secret
        const aliceInit = await contract.connect(alice).userInitializations(alice.address);
        const [aliceSecret, _, __] = [
          aliceInit[0].slice(2), // omit 0x
          aliceInit[1] ? '02' : '03', // boolean to prefix
          aliceInit[2].slice(2), // omit 0x
        ];
        // NOTE: alice also decrypts the user secret with her metamask key, but we do not do it in this test.
        // alice decrypts the chat secret
        const aliceBuffer = Buffer.from(aliceSecret, 'hex'); // TODO: refactor
        const eciesScheme = new CryptoECIES(aliceBuffer);
        const chatSecret = eciesScheme.decrypt(chatSecretEncryptedForAlice);

        // alice encrypts the message
        const aes256Scheme = new CryptoAES256(chatSecret);
        const ciphertext = aes256Scheme.encrypt(message);

        // alice sends the message
        const time = BigNumber.from(Date.now());
        await expect(contract.connect(alice).sendMessage(ciphertext.toString('hex'), bob.address, time))
          .to.emit(contract, 'MessageSent')
          .withArgs(alice.address, bob.address, ciphertext.toString('hex'), time);
      });

      it('should allow bob to decrypt his encrypted message', async () => {
        // bob queries the message
        const event = await contract.queryFilter(contract.filters.MessageSent(alice.address, bob.address));
        expect(event.length).to.eq(1);
        expect(event[0].args._from).to.eq(alice.address);
        expect(event[0].args._to).to.eq(bob.address);
        const ciphertext = Buffer.from(event[0].args._message, 'hex');

        // bob gets the encrypted chat secret from chatInitializations
        const chatSecretEncryptedForBob = Buffer.from(
          (await contract.chatInitializations(bob.address, alice.address)).slice(2),
          'hex'
        );

        // bob gets the encrypted user secret necessary to create the decryptor of the chat secret
        const bobInit = await contract.connect(bob).userInitializations(bob.address);
        const [bobSecret, _, __] = [
          bobInit[0].slice(2), // omit 0x
          bobInit[1] ? '02' : '03', // boolean to prefix
          bobInit[2].slice(2), // omit 0x
        ];

        // NOTE: bob also decrypts the user secret with his metamask key, but we do not do it in this test.
        // bob decrypts the chat secret
        const bobBuffer = Buffer.from(bobSecret, 'hex'); // TODO: refactor
        const eciesScheme = new CryptoECIES(bobBuffer);
        const chatSecret = eciesScheme.decrypt(chatSecretEncryptedForBob);

        // bob encrypts the message
        const aes256Scheme = new CryptoAES256(chatSecret);
        const plaintext = aes256Scheme.decrypt(ciphertext);

        expect(plaintext).to.eql(message);
      });
    });
  });
});
