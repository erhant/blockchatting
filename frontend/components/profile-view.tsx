import {Box, Text, Group, Stack, ActionIcon} from '@mantine/core';
import type {FC} from 'react';
import ReactNiceAvatar from 'react-nice-avatar';
import {addressToUsername, addressToAvatarConfig} from '../lib/profile';
import {truncateAddress} from '../utils/utility';
import {ChatBubbleLeftIcon} from '@heroicons/react/24/solid';
import styles from '../styles/profile-view.module.scss';
import {useClipboard} from '@mantine/hooks';

const ProfileView: FC<{
  address: string;
  onClick?: () => void;
  isMe: boolean;
}> = ({address, onClick, isMe}) => {
  const clipboard = useClipboard({timeout: 500});

  return (
    <Group p="sm" className={onClick && styles['clickable']} onClick={onClick}>
      <ReactNiceAvatar className={styles['image']} {...addressToAvatarConfig(address)} />
      <Stack spacing={0}>
        <Text>{addressToUsername(address)}</Text>
        <Group spacing="xs">
          <Text color="dimmed" onClick={() => clipboard.copy(address)} sx={{':hover': {cursor: 'pointer'}}}>
            {truncateAddress(address)}
          </Text>
          {/* {onClick && (
            <ActionIcon onClick={onClick}>
              <ChatBubbleLeftIcon height="70%" />
            </ActionIcon>
          )} */}
        </Group>
      </Stack>
    </Group>
  );
};

export default ProfileView;
