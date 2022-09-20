import {ArrowPathIcon, PaperAirplaneIcon} from '@heroicons/react/24/solid';
import {Box, Container, Text, Divider, TextInput, ActionIcon, Loader, Group, Stack, ScrollArea} from '@mantine/core';
import {BigNumber} from 'ethers';
import {FC, useEffect, useState} from 'react';
import {CryptoAES256} from '../lib/crypto';
import {Chat} from '../types/typechain';
import {notifyError, notifyTransaction} from '../utils/notify';
import Message from './message';
import styles from '../styles/messaging-board.module.scss';

type MessageType = {
  own: boolean;
  message: string;
  time: number;
};

const MessagingBoard: FC<{myAddress: string; peerAddress: string; contract: Chat; chatScheme: CryptoAES256}> = ({
  myAddress,
  peerAddress,
  contract,
  chatScheme,
}) => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isMessageBeingSent, setIsMessageBeingSent] = useState(false);

  /**
   * Retrieves messages between the peer and user. These are sorted
   * by their times too (not blocktimestamp, but rather the time)
   */
  async function getMessages() {
    console.log(myAddress, peerAddress);
    const [msgFromMe, msgToMe] = await Promise.all([
      contract.queryFilter(contract.filters.MessageSent(myAddress, peerAddress)),
      contract.queryFilter(contract.filters.MessageSent(peerAddress, myAddress)),
    ]);

    // sort messages by block number
    const msgsRaw = myAddress == peerAddress ? msgFromMe : msgFromMe.concat(msgToMe);
    console.log(msgsRaw.map(m => m.args));
    const msgs: MessageType[] = msgsRaw
      .sort((a, b) => (a.args._time.lt(b.args._time) ? -1 : 1))
      .map(msgEvent => ({
        own: msgEvent.args._from.toLowerCase() == myAddress,
        message: chatScheme.decrypt(Buffer.from(msgEvent.args._message, 'hex')).toString(),
        time: msgEvent.args._time.toNumber(),
      }));
    setMessages(msgs);
  }

  useEffect(() => {
    getMessages();
  }, []);

  /**
   * Sends a non-empty message encrypted with the chat secret.
   */
  async function handleSendMessage() {
    if (messageInput == '') return;
    setIsMessageBeingSent(true);
    try {
      const tx = await contract.sendMessage(
        chatScheme.encrypt(Buffer.from(messageInput)).toString('hex'),
        peerAddress,
        BigNumber.from(Date.now())
      );
      await tx.wait();
    } catch (e) {
      notifyError(e, 'Could not send message.');
    }
    setIsMessageBeingSent(false);
  }

  return (
    <Box className={styles['messaging-board']}>
      <ScrollArea className={styles['messages']}>
        {messages.length > 0 ? (
          messages.map((m, i) => (
            <Box key={i} sx={{width: '100%'}}>
              <Message own={m.own} time={new Date(m.time).toLocaleTimeString('tr')} text={m.message} />
            </Box>
          ))
        ) : (
          <Text color="dimmed" sx={{textAlign: 'center'}}>
            start chatting below
          </Text>
        )}
      </ScrollArea>
      <Divider my="md" />

      {/* new message input */}
      <Group>
        {/* refresh icon */}
        <ActionIcon onClick={getMessages}>
          <ArrowPathIcon />
        </ActionIcon>

        {/* message input */}
        <TextInput
          sx={{flexGrow: 1}}
          placeholder="type something!"
          value={messageInput}
          disabled={isMessageBeingSent}
          onChange={event => setMessageInput(event.currentTarget.value)}
        />
        {/* send button */}
        {isMessageBeingSent ? (
          <Loader />
        ) : (
          <ActionIcon onClick={handleSendMessage}>
            <PaperAirplaneIcon />
          </ActionIcon>
        )}
      </Group>
    </Box>
  );
};

export default MessagingBoard;
