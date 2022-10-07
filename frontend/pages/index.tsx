import type {NextPage} from 'next';
import Layout from '../components/layout';
import {useWalletContext} from '../context/wallet.context';
import WalletConnection from '../components/wallet-connection';
import Onboarding from '../components/onboarding';

const Home: NextPage = () => {
  const {wallet} = useWalletContext();

  return wallet ? (
    <Onboarding address={wallet.address} />
  ) : (
    <Layout centered>
      <WalletConnection />
    </Layout>
  );
};

export default Home;
