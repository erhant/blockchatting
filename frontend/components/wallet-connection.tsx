import {Image, Stack, Text, Box, Center} from '@mantine/core';
import {FC} from 'react';
import {useWalletContext} from '../context/wallet.context';
import styles from '../styles/wallet-connection.module.scss';

const WalletConnection: FC = () => {
  const {disconnectWallet, connectWallet, wallet} = useWalletContext(); 

  return (
    <Center className={styles['center']}>
      <Stack onClick={() => (wallet ? disconnectWallet() : connectWallet())} p="md">
        <Text id={styles['welcome-text']}>Connect your wallet to start chatting!</Text>
        <Box className={styles['login-center']}>
          <Center>
            <Image id={styles['metamask-logo']} src="/brands/metamask.svg" alt="metamask" />
          </Center>
          <Text>{wallet ? 'Disconnect' : 'Login with MetaMask'}</Text>
        </Box>
      </Stack>
    </Center>
  );
};

export default WalletConnection;
