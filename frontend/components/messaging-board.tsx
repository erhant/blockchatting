import {ArrowPathIcon} from '@heroicons/react/24/solid';
import {Box, Container, Text, Button, Divider, TextInput, ActionIcon, Loader} from '@mantine/core';
import {BigNumber} from 'ethers';
import {FC, useState} from 'react';
import {CryptoAES256} from '../lib/crypto';
import {Chat} from '../types/typechain';
import {notifyError, notifyTransaction} from '../utils/notify';

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
    const [msgFromMe, msgToMe] = await Promise.all([
      contract.queryFilter(contract.filters.MessageSent(myAddress, peerAddress)),
      contract.queryFilter(contract.filters.MessageSent(peerAddress, myAddress)),
    ]);

    // sort messages by block number
    const msgs: MessageType[] = msgFromMe
      .concat(msgToMe)
      // TODO: is this right?
      .sort((a, b) => (a.args._time.lt(b.args._time) ? 1 : -1))
      .map(msgEvent => ({
        own: msgEvent.args._from == myAddress,
        message: chatScheme.decrypt(Buffer.from(msgEvent.args._message, 'hex')).toString(),
        time: msgEvent.args._time.toNumber(),
      }));
    setMessages(msgs);
  }

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
    <Box>
      {messages ? (
        messages.map((m, i) => (
          <Text key={i} sx={{color: m.own ? 'red' : 'blue'}}>
            {m.message}
          </Text>
        ))
      ) : (
        <Text>No messages yet.</Text>
      )}
      <Divider />

      {/* new message input */}
      <TextInput
        placeholder="type something!"
        value={messageInput}
        disabled={isMessageBeingSent}
        onChange={event => setMessageInput(event.currentTarget.value)}
        rightSection={
          isMessageBeingSent ? (
            <Loader />
          ) : (
            <Button size="xs" onClick={handleSendMessage}>
              Send
            </Button>
          )
        }
        icon={
          <ActionIcon onClick={getMessages}>
            <ArrowPathIcon />
          </ActionIcon>
        }
      />
    </Box>
  );
};

export default MessagingBoard;
