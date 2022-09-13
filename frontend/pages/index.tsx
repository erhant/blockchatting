import type {NextPage} from 'next';
import Layout from '../components/layout';
import {Anchor, Button, Box} from '@mantine/core';
import Link from 'next/link';

const Home: NextPage = () => {
  return (
    <Layout>
      <>
        <Box>
          <Link href="/testing" passHref>
            <Anchor>
              <Button variant="light" size="xl">
                Testing
              </Button>
            </Anchor>
          </Link>
          <Link href="/chat" passHref>
            <Anchor>
              <Button variant="light" size="xl">
                Chatting
              </Button>
            </Anchor>
          </Link>
        </Box>
      </>
    </Layout>
  );
};

export default Home;
