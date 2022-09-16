import {Container, Group, Text} from '@mantine/core';
import type {FC} from 'react';

const Message: FC<{
  own: boolean;
  text: string;
  time: string;
}> = ({own, text, time}) => {
  return (
    <Group position={own ? 'right' : 'left'}>
      <Text>{text}</Text>
    </Group>
  );
};

export default Message;
