import {Box, Container, Text, Group, Grid, Stack, TextInput, Button, Title} from '@mantine/core';
import ThemeToggleButton from './theme-toggle-button';
import Link from 'next/link';
import {FC, useState} from 'react';
import {Chat} from '../types/typechain';
import {CryptoAES256, CryptoECIES, generateSecret} from '../lib/crypto';
import {truncateAddress} from '../utils/utility';
import {ethers} from 'ethers';
import {notify, notifyError, notifyTransaction, notifyTransactionUpdate} from '../utils/notify';
import MessagingBoard from './messaging-board';

// Dashboard is the main page, there is no header here. Just like Whatsapp
// User initialization is passed as a prop here
const Dashboard: FC<{myAddress: string; contract: Chat; userScheme: CryptoECIES; previousPeers: string[]}> = ({
  myAddress,
  contract,
  userScheme,
  previousPeers,
}) => {
  const [peerAddressInput, setPeerAddressInput] = useState<string>('');
  const [peerAddress, setPeerAddress] = useState<string>();
  const [chatScheme, setChatScheme] = useState<CryptoAES256>();

  async function setPeer() {
    // check peer address
    if (!ethers.utils.isAddress(peerAddressInput)) {
      notify('Incorrect Address', `${peerAddressInput} is not a valid address.`, 'error');
      return;
    } else {
      setPeerAddress(peerAddressInput);
    }

    // check initialization
    setChatScheme(undefined);
    const isChatInitialized = await contract.isChatInitialized(myAddress, peerAddressInput);

    if (isChatInitialized) {
      // setup chat secret
      const chatSecretEncrypted = await contract.chatInitializations(myAddress, peerAddressInput);
      const encryptedChatSecret = Buffer.from(chatSecretEncrypted.slice(2), 'hex');
      const chatSecret = userScheme.decrypt(encryptedChatSecret);
      setChatScheme(new CryptoAES256(chatSecret));

      // load messages & subscribe
      // TODO
    }
  }

  /**
   *
   */
  async function initializeChat(peerAddress: string) {
    // generate secret from chat scheme
    const chatSecret = generateSecret();

    // fetch peer's public key
    const peerInit = await contract.userInitializations(peerAddress);

    // encrypt for peer
    const peerPublicKey = Buffer.from((peerInit.publicKeyPrefix ? '02' : '03') + peerInit.publicKeyX.slice(2), 'hex');
    const chatSecretEncryptedForPeer = CryptoECIES.encrypt(peerPublicKey.toString('hex'), chatSecret);
    const chatSecretEncryptedForMe = userScheme.encrypt(chatSecret);

    // initialize chat and update state
    try {
      const tx = await contract.initializeChat(chatSecretEncryptedForMe, chatSecretEncryptedForPeer, peerAddress);
      const txID = notifyTransaction(tx);
      await tx.wait();
      notifyTransactionUpdate(txID, 'Chat initialized!', 'success');
      setChatScheme(new CryptoAES256(chatSecret));
    } catch (e) {
      notifyError(e, 'Could not initialize chat.');
    }
  }

  return (
    <Box sx={{width: '50vw', height: '90vh'}}>
      <Grid>
        <Grid.Col xs={4}>
          {/* show my profile */}
          <Stack sx={{backgroundColor: 'whitesmoke'}}>
            <Text>{truncateAddress(myAddress)}</Text>
            <Text>This is you.</Text>
          </Stack>

          {/* show previous chat peers */}
          <Text>Chat History</Text>
          {previousPeers.map((peer, i) => (
            <Box key={i} py="sm" sx={{border: '1px solid gray'}}>
              <Text>{truncateAddress(peer)}</Text>
            </Box>
          ))}

          {/* enter peer address here */}
          <TextInput
            placeholder="peer address"
            value={peerAddressInput}
            onChange={event => setPeerAddressInput(event.currentTarget.value)}
            rightSection={
              <Button size="xs" onClick={() => setPeer()}>
                Go
              </Button>
            }
          />
        </Grid.Col>
        <Grid.Col xs={8}>
          {peerAddress ? (
            // peer address is here, but we do not know if it is initialized or not
            <>
              <Stack sx={{backgroundColor: 'whitesmoke'}}>
                <Text>{truncateAddress(peerAddress)}</Text>
                <Text>This is your peer.</Text>
              </Stack>
              {chatScheme ? (
                // we have the chat secret
                <MessagingBoard
                  chatScheme={chatScheme}
                  contract={contract}
                  myAddress={myAddress}
                  peerAddress={peerAddress}
                />
              ) : (
                //we have peer but it is not initialized
                <Button onClick={() => initializeChat(peerAddress)}>Initialize Chat</Button>
              )}
            </>
          ) : (
            // just a welcome message here
            <Text>Start chatting by choosing a person from left, or entering a new address.</Text>
          )}
        </Grid.Col>
      </Grid>
    </Box>
  );
};

export default Dashboard;
