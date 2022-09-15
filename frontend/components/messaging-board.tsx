import {Box, Container, Text, Button, Divider} from '@mantine/core';
import {BigNumber} from 'ethers';
import Link from 'next/link';
import {FC, useState} from 'react';
import {CryptoAES256} from '../lib/crypto';
import {Chat} from '../types/typechain';

type MessageType = {
  from: string;
  to: string;
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
        from: msgEvent.args._from,
        to: msgEvent.args._from,
        message: chatScheme.decrypt(Buffer.from(msgEvent.args._message, 'hex')).toString(),
        time: msgEvent.args._time.toNumber(),
      }));
    setMessages(msgs);
  }

  async function handleSendMessage() {
    const message = 'hello world.';

    contract
      .sendMessage(chatScheme.encrypt(Buffer.from(message)).toString('hex'), peerAddress, BigNumber.from(Date.now()))
      .then(() => {
        console.log('Message sent.');
      });
  }

  return (
    <Box>
      <Text>messages here lol</Text>
      {messages ? messages.map((m, i) => <Text key={i}>{m.message}</Text>) : <Text>No messages yet.</Text>}
      <Divider />
      <Button onClick={handleSendMessage}>Send</Button>
      <Button onClick={getMessages}>Refresh</Button>
    </Box>
  );
};

export default MessagingBoard;
