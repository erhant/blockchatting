import {ethers, network} from 'hardhat';
import {expect} from 'chai';
//@ts-ignore // the objects here are created by typechain
import {Chat__factory, Chat} from '../types/typechain';
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers';
import contractConstants from '../constants';
import {CryptoChat, CryptoEOA} from '../../frontend/api/public-key-crypto';
import {randomBytes} from 'crypto';
import {formatEther, parseEther} from 'ethers/lib/utils';
import {BigNumber, ContractTransaction} from 'ethers';

describe('Chat', function () {
  let chatContract: Chat;
  let tx: ContractTransaction;

  // signers
  let owner: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;
  let addrs: SignerWithAddress[];

  // deploy the contract once
  before(async function () {
    const factory = (await ethers.getContractFactory('Chat')) as unknown as Chat__factory;
    [owner, alice, bob, ...addrs] = await ethers.getSigners();
    chatContract = await factory.deploy();
    await chatContract.deployed();

    // Alice generates her keys
    const aliceSecret = CryptoChat.generateSecret();
    const alicePubkey = Buffer.from(new CryptoChat(aliceSecret).getPublicKey(), 'hex');

    tx = await chatContract.connect(alice).initializeUser(
      aliceSecret.toJSON().data, // this is supposed to be encrypted, but we dont do it in the test
      alicePubkey.at(0) == 2, // prefix
      alicePubkey.slice(1).toJSON().data // 32 bytes
    );

    // // Bob generates his keys
    const bobSecret = CryptoChat.generateSecret();
    const bobPubkey = Buffer.from(new CryptoChat(bobSecret).getPublicKey(), 'hex');

    await chatContract.connect(bob).initializeUser(
      bobSecret.toJSON().data, // this is supposed to be encrypted, but we dont do it in the test
      bobPubkey.at(0) == 2, // prefix
      bobPubkey.slice(1).toJSON().data // 32 bytes
    );
  });

  describe('deployment', function () {
    it('should have alice and bob initialized', async function () {
      expect(await chatContract.isInitialized(alice.address)).to.be.true;
      expect(await chatContract.isInitialized(bob.address)).to.be.true;
    });

    it('should have owner as owner', async function () {
      expect(await chatContract.owner()).to.eq(owner.address);
    });
  });

  describe('messaging', function () {
    it('should encrypt & decrypt correctly', async function () {
      // alice will send some message to bob
      const message = randomBytes(32);

      // she creates a random private key to chat with bob
      const secret = randomBytes(32);

      // alice get bob's public key and encrypts the secret
      const bobInitEvent = (await chatContract.queryFilter(chatContract.filters.UserInitialized(bob.address)))[0].args;
      const [bobPubkeyPrefix, bobPubkeyX, bobSecretHex] = [
        bobInitEvent._pubKeyPrefix ? '02' : '03',
        bobInitEvent._pubKeyX.slice(2), // omit 0x
        bobInitEvent._encSecret.slice(2), // omit 0x
      ];
      const bobPubkey = Buffer.from(bobPubkeyPrefix + bobPubkeyX, 'hex');
      const secretEncryptedForBob = CryptoChat.encrypt(bobPubkey.toString('hex'), secret);

      // she also does the same for herself
      const aliceInitEvent = (await chatContract.queryFilter(chatContract.filters.UserInitialized(bob.address)))[0]
        .args;
      const [alicePubkeyPrefix, alicePubkeyX, aliceSecretHex] = [
        bobInitEvent._pubKeyPrefix ? '02' : '03',
        bobInitEvent._pubKeyX.slice(2), // omit 0x
        bobInitEvent._encSecret.slice(2), // omit 0x
      ];
      const alicePubkey = Buffer.from(bobPubkeyPrefix + bobPubkeyX, 'hex');
      const secretEncryptedForAlice = CryptoChat.encrypt(alicePubkey.toString('hex'), secret);

      // alice initializes the chat with bob
      await chatContract.initialize();
      // alice encrypts the message with secret and sends it to bob
      tx = await chatContract.connect(alice).sendMessage(ciphertext.toString('hex'), bob.address);
      expectEvent(await tx.wait(), 'MessageSent', r => {
        let [_from, _to, _message] = [r._from, r._to, r._message];
        expect(_from).eq(alice.address);
        expect(_to).eq(bob.address);

        // bob will decrypt by creating the key pair with his secret
        const ciphertext = Buffer.from(_message, 'hex');
        const bobCryptoChat = new CryptoChat(Buffer.from(bobSecretHex, 'hex'));
        const plaintext = bobCryptoChat.decrypt(ciphertext);
        expect(plaintext.equals(message)).to.be.true;
        return true;
      });
    });
  });
});
