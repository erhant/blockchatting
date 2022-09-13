import {Popover, ActionIcon, Title, Group, Stack, Text, Image} from '@mantine/core';
import {BigNumber} from 'ethers';
import {formatEther} from 'ethers/lib/utils';
import {useState, useEffect, FC} from 'react';
import {WalletIcon} from '@heroicons/react/24/solid';
import getNetwork, {unknownNetwork} from '../constants/networks';
import {useWalletContext} from '../context/wallet.context';
import type {NetworkInfoType} from '../types/networks';
import {truncateAddress} from '../utils/utility';

const WalletDisplayButton: FC = () => {
  const {wallet} = useWalletContext();
  const [opened, setOpened] = useState(false);
  const [balance, setBalance] = useState<BigNumber>(BigNumber.from(0));
  const [network, setNetwork] = useState<NetworkInfoType>(unknownNetwork);

  useEffect(() => {
    if (wallet) {
      wallet.library.getBalance(wallet.address).then(val => setBalance(val));
      setNetwork(getNetwork(wallet.chainId));
    } else {
      setBalance(BigNumber.from(0));
      setNetwork(unknownNetwork);
    }
  }, [wallet]);

  return (
    <Popover
      opened={opened}
      onClose={() => setOpened(false)}
      target={
        <ActionIcon disabled={wallet === undefined} onClick={() => setOpened(o => !o)}>
          <WalletIcon fontSize="1.2em" />
        </ActionIcon>
      }
      width="min(90vw,500px)"
      position="bottom"
      withArrow
      withCloseButton
    >
      {wallet ? (
        <Group position="apart">
          <Stack>
            {/* Network Details */}
            <Title order={2}>Network</Title>
            <Text size="xl">{network.chainName}</Text>
            <Text color="dimmed">Chain ID: {wallet.chainId}</Text>

            {/* Wallet Details */}
            <Title order={2} mt="md">
              Wallet ID
            </Title>
            <Text>{truncateAddress(wallet.address)}</Text>

            {/* Balance */}
            <Title order={2} mt="md">
              Balance
            </Title>
            <Text>{formatEther(balance) + ' ' + network.nativeCurrency.symbol}</Text>
          </Stack>
          <Image src={network.iconURL} alt="network icon" m="md" width={150} height={200} fit="contain" />
        </Group>
      ) : (
        <Title p="lg">Wallet not connected.</Title>
      )}
    </Popover>
  );
};

export default WalletDisplayButton;
