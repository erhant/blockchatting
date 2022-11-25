import {Image, Stack, Text, Box, Center} from '@mantine/core';
import type {FC} from 'react';
import styles from '../styles/wallet-connection.module.scss';
import {useAccount, useConnect, useDisconnect, chain} from 'wagmi';

const WalletConnection: FC = () => {
  const {isConnected} = useAccount();
  const {connect, connectors} = useConnect();
  const {disconnect} = useDisconnect();

  return (
    <Center className={styles['center']}>
      <Stack onClick={() => (isConnected ? disconnect() : connect({connector: connectors[0]}))} p="md">
        <Text id={styles['welcome-text']}>Connect your wallet to start chatting!</Text>
        <Box className={styles['login-center']}>
          <Center>
            <Image id={styles['metamask-logo']} src="/brands/metamask.svg" alt="metamask" />
          </Center>
          <Text>{isConnected ? 'Disconnect' : 'Login with MetaMask'}</Text>
        </Box>
      </Stack>
    </Center>
  );
};

export default WalletConnection;
