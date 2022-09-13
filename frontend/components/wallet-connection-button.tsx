import {Button} from '@mantine/core';
import {FC} from 'react';
import {useWalletContext} from '../context/wallet.context';

const WalletConnectionButton: FC = () => {
  const {disconnectWallet, connectWallet, wallet} = useWalletContext();

  return (
    <Button
      onClick={() => (wallet ? disconnectWallet() : connectWallet())}
      variant="gradient"
      gradient={{from: 'secondary', to: 'primary', deg: 42}}
    >
      {wallet ? 'Disconnect' : 'Connect'}
    </Button>
  );
};

export default WalletConnectionButton;
