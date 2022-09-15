import type {NextPage} from 'next';
import Layout from '../components/layout';
import {Anchor, Button, Box} from '@mantine/core';
import Link from 'next/link';
import {useWalletContext} from '../context/wallet.context';
import WalletConnection from '../components/wallet-connection';
import Onboarding from '../components/onboarding';

const Home: NextPage = () => {
  const {wallet} = useWalletContext();
  return <Layout centered>{wallet ? <Onboarding wallet={wallet} /> : <WalletConnection />}</Layout>;
};

export default Home;
