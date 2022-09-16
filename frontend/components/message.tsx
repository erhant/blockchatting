import {Paper, Group, Text} from '@mantine/core';
import type {FC} from 'react';

const Message: FC<{
  own: boolean;
  text: string;
  time: string;
}> = ({own, text, time}) => {
  return (
    <Group position={own ? 'right' : 'left'}>
      <Paper shadow="xs" p="xs" pb="md" m="xs" sx={{position: 'relative'}} radius="md" withBorder>
        <Text>{text}</Text>
        <Text sx={{position: 'absolute', bottom: 2, right: 4, fontSize: '0.7em'}}>{time}</Text>
      </Paper>
    </Group>
  );
};

export default Message;
