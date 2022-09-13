import {Title} from '@mantine/core';
import {FC} from 'react';
import Layout from './layout';

const NoWallet: FC = () => {
  return (
    <Layout>
      <Title p="xl">Please connect your wallet first.</Title>
    </Layout>
  );
};

export default NoWallet;
