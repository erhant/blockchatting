import type {NextPage} from 'next';
import Layout from '../components/layout';
import {useAccount} from 'wagmi';
import WalletConnection from '../components/wallet-connection';
import Onboarding from '../components/onboarding';

const Home: NextPage = () => {
  const {address} = useAccount();

  return address ? (
    <Onboarding address={address} />
  ) : (
    <Layout centered>
      <WalletConnection />
    </Layout>
  );
};

export default Home;
