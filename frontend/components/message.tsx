import {Paper, Group, Text} from '@mantine/core';
import type {FC} from 'react';
import {MessageType} from '../types/message';

const TIME_LOCALES = ['tr', 'en'];

/// A single message component
const Message: FC<MessageType> = ({own, message, time}) => {
  return (
    <Group position={own ? 'right' : 'left'}>
      <Paper shadow="xs" p="xs" pb="md" m="xs" sx={{position: 'relative', minWidth: '4em'}} radius="md" withBorder>
        <Text>{message}</Text>
        <Text sx={{position: 'absolute', bottom: 2, right: 4, fontSize: '0.7em'}}>
          {new Date(time).toLocaleTimeString(TIME_LOCALES)}
        </Text>
      </Paper>
    </Group>
  );
};

export default Message;
