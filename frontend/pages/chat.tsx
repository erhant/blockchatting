import {NextPage} from 'next';
import {useWalletContext} from '../context/wallet.context';
import {useEffect, useState} from 'react';
import Layout from '../components/layout';
import {Button, Text, Group, Title, Box, Divider, Grid, Stack} from '@mantine/core';
import {useChatContext} from '../context/chat.context';
import NoWallet from '../components/no-wallet';
import {CryptoECIES, CryptoMetaMask, CryptoAES256, generateSecret} from '../lib/crypto';
import {parseEther} from 'ethers/lib/utils';
import {BigNumber} from 'ethers';

type MessageType = {
  from: string;
  to: string;
  message: string;
  time: number;
};
const CounterContractPage: NextPage = () => {
  const {wallet} = useWalletContext();
  const {contract} = useChatContext();
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [cryptoMetaMask, setCryptoMetaMask] = useState<CryptoMetaMask>();
  const [cryptoECIES, setCryptoECIES] = useState<CryptoECIES>();
  const [cryptoAES256, setCryptoAES256] = useState<CryptoAES256>();
  const [peerAddress, setPeerAddress] = useState<string>();
  const isUserInitialized = cryptoECIES != undefined;
  const isChatInitialized = cryptoAES256 != undefined;

  const myAddress = wallet?.address || '';

  useEffect(() => {
    setCryptoMetaMask(new CryptoMetaMask(myAddress, window.ethereum));
  }, [wallet]);

  useEffect(() => {
    if (!contract || !cryptoMetaMask) return;

    // everyone sees contract owner as the first peerAddress
    contract.owner().then(o => setPeerAddress(o));

    // get initialization
    contract.isUserInitialized(myAddress).then(isUserInitialized => {
      if (isUserInitialized) {
        // retrieve and decrypt your secret
        contract.userInitializations(myAddress).then(userInitialization => {
          const encryptedUserSecret = Buffer.from(userInitialization[0].slice(2), 'hex');
          cryptoMetaMask.decrypt(encryptedUserSecret).then(userSecret => setCryptoECIES(new CryptoECIES(userSecret)));
        });
      }
    });

    // TODO: get history of chat initializations to display them as a history of chatted users

    return () => {
      // unsubscribe from events
      contract.removeAllListeners();
      setPeerAddress(undefined);
    };
  }, [contract, cryptoMetaMask]);

  function initializeUser() {
    if (!contract || !cryptoMetaMask) return;
    // encrypt and store your secret
    const entryFee = parseEther('0.1'); // TODO: retrieve this from contract
    const userSecret = generateSecret();
    const publicKey = Buffer.from(new CryptoECIES(userSecret).getPublicKey(), 'hex');
    cryptoMetaMask.encrypt(userSecret).then(encryptedUserSecret => {
      console.log(userSecret, encryptedUserSecret);
      contract
        .initializeUser(
          encryptedUserSecret.toJSON().data, // this is supposed to be encrypted by MetaMask, but we dont do it in the test
          publicKey[0] == 2, // prefix
          publicKey.slice(1).toJSON().data, // 32 bytes
          {
            value: entryFee,
          }
        )
        // TODO: call this from an event, instead of this promise
        .then(() => setCryptoECIES(new CryptoECIES(userSecret)));
    });
  }

  function initializeChat() {
    if (!peerAddress || !contract || !cryptoECIES) return;

    // get peerAddress key
    contract.isChatInitialized(myAddress, peerAddress).then(isChatInitialized => {
      if (isChatInitialized) {
        // get chat secret
        contract.chatInitializations(myAddress, peerAddress).then(chatSecretEncrypted => {
          const encryptedChatSecret = Buffer.from(chatSecretEncrypted.slice(2), 'hex');
          const chatSecret = cryptoECIES.decrypt(encryptedChatSecret);
          setCryptoAES256(new CryptoAES256(chatSecret));
        });
      } else {
        const chatSecret = generateSecret();
        // encrypt with both keys

        contract.userInitializations(peerAddress).then(userInitialization => {
          // encrypt for peerAddress
          const peerPublicKey = Buffer.from(
            (userInitialization[1] ? '02' : '03') + userInitialization[2].slice(2),
            'hex'
          );
          const chatSecretEncryptedForPeer = CryptoECIES.encrypt(peerPublicKey.toString('hex'), chatSecret);
          // encrypt for yourself
          const chatSecretEncryptedForMe = cryptoECIES.encrypt(chatSecret);

          // initialize chat and update state
          contract.initializeChat(chatSecretEncryptedForMe, chatSecretEncryptedForPeer, peerAddress).then(() => {
            // TODO: call this from an event, instead of this promise
            setCryptoAES256(new CryptoAES256(chatSecret));
          });
        });
      }
    });
  }

  useEffect(() => {
    if (!peerAddress || !contract || !cryptoAES256) return;

    // get messages
    Promise.all([
      contract.queryFilter(contract.filters.MessageSent(myAddress, peerAddress)),
      contract.queryFilter(contract.filters.MessageSent(peerAddress, myAddress)),
    ]).then(([msgFromMe, msgToMe]) => {
      // sort messages by block number
      const msgs: MessageType[] = msgFromMe
        .concat(msgToMe)
        // TODO: is this right?
        .sort((a, b) => (a.args._time.lt(b.args._time) ? 1 : -1))
        .map(msgEvent => ({
          from: msgEvent.args._from,
          to: msgEvent.args._from,
          message: cryptoAES256.decrypt(Buffer.from(msgEvent.args._message, 'hex')).toString('hex'), // TODO decrypt here
          time: msgEvent.args._time.toNumber(),
        }));
      // decrypt messages
    });

    return () => {
      setCryptoAES256(undefined);
    };
  }, [peerAddress, cryptoAES256]);

  async function handleSendMessage() {
    if (!contract || !isUserInitialized || !cryptoAES256) return;
    // TODO: get message from input
    const message = 'hello world.';

    contract
      .sendMessage(cryptoAES256.encrypt(Buffer.from(message)).toString('hex'), peerAddress!, BigNumber.from(Date.now()))
      .then(() => {
        console.log('Message sent.');
      });
  }

  async function handleSetPeer() {
    setPeerAddress(myAddress); // TODO: for demo purposes
  }

  if (!contract) {
    return <NoWallet />;
  } else {
    if (isUserInitialized) {
      return (
        <Layout>
          <Grid>
            <Grid.Col xs={3}>
              {/* show my profile */}
              <Stack>
                <Text>{myAddress}</Text>
              </Stack>

              {/* show chat history */}
              {/* TODO */}

              {/* enter peer address here */}
            </Grid.Col>
            <Grid.Col xs={9}>Chat soon</Grid.Col>
          </Grid>
        </Layout>
      );
    } else {
      return (
        // make this part in steps: (use Stepper)
        // 1. checking if user is initialized
        // 2. retrieving secret / creating key-pair

        <Layout>
          <Button onClick={initializeUser}>Initialize User</Button>
        </Layout>
      );
    }
  }
};

export default CounterContractPage;
