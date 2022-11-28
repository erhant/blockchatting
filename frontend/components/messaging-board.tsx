import {IconRefresh, IconSend} from '@tabler/icons';
import {Box, Text, Divider, TextInput, ActionIcon, Loader, Group, ScrollArea} from '@mantine/core';
import {BigNumber} from 'ethers';
import {FC, useCallback, useEffect, useState} from 'react';
import {CryptoAES256} from '../lib/crypto';
import {Chat} from '../types/typechain';
import {notifyError} from '../utils/notify';
import Message from './message';
import styles from '../styles/messaging-board.module.scss';
import {MessageSentListener, MessageType} from '../types/message';

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
  const getMessages: () => void = useCallback(async () => {
    const [msgFromMe, msgToMe] = await Promise.all([
      contract.queryFilter(contract.filters.MessageSent(myAddress, peerAddress)),
      contract.queryFilter(contract.filters.MessageSent(peerAddress, myAddress)),
    ]);

    // sort messages by block number
    const msgsRaw = (myAddress == peerAddress ? msgFromMe : msgFromMe.concat(msgToMe)).map(msgRaw => msgRaw.args);
    const msgs: MessageType[] = msgsRaw
      .sort((a, b) => (a._time.lt(b._time) ? -1 : 1))
      .map(msgRaw => ({
        own: msgRaw._from.toLowerCase() == myAddress.toLowerCase(),
        message: chatScheme.decrypt(Buffer.from(msgRaw._message, 'hex')).toString(),
        time: msgRaw._time.toNumber(),
      }));
    setMessages(msgs);
  }, [chatScheme, contract, myAddress, peerAddress]);

  /// Update messages as a result of event
  const updateMessages: MessageSentListener = useCallback(
    (_from: string, _to: string, _message: string, _time: BigNumber) => {
      console.log('Message received from:', _from);
      setMessages(msgs => [
        ...msgs,
        {
          own: _from.toLowerCase() == myAddress.toLowerCase(),
          message: chatScheme.decrypt(Buffer.from(_message, 'hex')).toString(),
          time: _time.toNumber(),
        },
      ]);
    },
    [chatScheme, myAddress]
  );

  useEffect(() => {
    // get existing messages
    getMessages();

    // subscribe to new messages
    if (peerAddress.toLowerCase() != myAddress.toLowerCase()) {
      contract.on(contract.filters.MessageSent(myAddress, peerAddress, null, null), updateMessages);
    }
    contract.on(contract.filters.MessageSent(peerAddress, myAddress, null, null), updateMessages);

    // unsubscribe
    return () => {
      contract.removeAllListeners();
    };
  }, [contract, getMessages, myAddress, peerAddress, updateMessages]);

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
      setMessageInput('');
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
              <Message own={m.own} time={m.time} message={m.message} />
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
          <IconRefresh />
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
            <IconSend />
          </ActionIcon>
        )}
      </Group>
    </Box>
  );
};

export default MessagingBoard;
