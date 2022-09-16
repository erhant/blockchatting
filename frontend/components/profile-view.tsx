import {Box, Text, Group, Stack, ActionIcon} from '@mantine/core';
import type {FC, ReactNode} from 'react';
import ReactNiceAvatar from 'react-nice-avatar';
import {addressToUsername, addressToAvatarConfig} from '../lib/profile';
import styles from '../styles/layout.module.scss';
import {truncateAddress} from '../utils/utility';
import {ChatBubbleLeftIcon} from '@heroicons/react/24/solid';
const ProfileView: FC<{
  address: string;
  onClick?: () => void;
  isMe: boolean;
}> = ({address, onClick, isMe}) => {
  return (
    <Group p="sm">
      <ReactNiceAvatar style={{width: '65px', height: '65px'}} {...addressToAvatarConfig(address)} />
      <Stack spacing="xs">
        <Text>{addressToUsername(address)}</Text>
        <Text color="dimmed">{truncateAddress(address)}</Text>
      </Stack>
      {onClick && (
        <ActionIcon onClick={onClick}>
          <ChatBubbleLeftIcon />
        </ActionIcon>
      )}
    </Group>
  );
};

export default ProfileView;
