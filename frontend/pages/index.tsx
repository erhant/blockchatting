import type {NextPage} from 'next';
import Layout from '../components/layout';
import {useWalletContext} from '../context/wallet.context';
import WalletConnection from '../components/wallet-connection';
import Onboarding from '../components/onboarding';

const Home: NextPage = () => {
  const {wallet} = useWalletContext();
  return <Layout centered>{wallet ? <Onboarding address={wallet.address} /> : <WalletConnection />}</Layout>;
};

export default Home;
