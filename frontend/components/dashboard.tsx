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
import ProfileView from './profile-view';

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

  async function setPeer(peer: string) {
    // check peer address
    if (!ethers.utils.isAddress(peer)) {
      notify('Incorrect Address', `${peer} is not a valid address.`, 'error');
      return;
    }
    setPeerAddress(peer);

    // check initialization
    setChatScheme(undefined);
    const isChatInitialized = await contract.isChatInitialized(myAddress, peer);
    if (isChatInitialized) {
      const chatSecretEncrypted = await contract.chatInitializations(myAddress, peer);
      const encryptedChatSecret = Buffer.from(chatSecretEncrypted.slice(2), 'hex');
      const chatSecret = userScheme.decrypt(encryptedChatSecret);
      setChatScheme(new CryptoAES256(chatSecret));
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
        <Grid.Col xs={5}>
          {/* show my profile */}
          <Title order={3}>You</Title>
          <ProfileView
            address={myAddress}
            isMe={true}
            onClick={() => {
              setPeer(myAddress);
            }}
          />

          {/* show previous chat peers */}
          <Title order={3}>Peers</Title>
          {previousPeers.length > 0 ? (
            previousPeers.map(
              (peer, i) =>
                peer != myAddress && (
                  <ProfileView
                    key={i}
                    address={peer}
                    isMe={false}
                    onClick={() => {
                      setPeer(peer);
                    }}
                  />
                )
            )
          ) : (
            <Text>You have not chatted with anyone yet!</Text>
          )}

          {/* enter peer address here */}
          <TextInput
            label="New Peer"
            placeholder="address"
            value={peerAddressInput}
            onChange={event => setPeerAddressInput(event.currentTarget.value)}
            rightSection={
              <Button size="xs" onClick={() => setPeer(peerAddressInput)}>
                Go
              </Button>
            }
          />
        </Grid.Col>
        <Grid.Col xs={7}>
          {peerAddress ? (
            // peer address is here, but we do not know if it is initialized or not
            <>
              <ProfileView address={peerAddress} isMe={peerAddress == myAddress} />
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
