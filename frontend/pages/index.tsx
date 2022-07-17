import type { NextPage } from "next"
import Layout from "../components/layout"
import { Text, Title, Anchor, Button, Group, Badge, Box } from "@mantine/core"
import Link from "next/link"

const Home: NextPage = () => {
  return (
    <Layout>
      <>
        <Box sx={{ width: "80%", textAlign: "center", margin: "auto" }} my="xl">
          <Title>NextJS + Web3 Starter</Title>
          <Text>
            <b>A template for your fresh decentralized application</b>. Develop and deploy your contracts using Hardhat,
            and then interact with them in your web application using NextJS. Enjoy the beauty of TypeScript in doing
            so!
          </Text>
        </Box>
        <Group position="center" sx={{ width: "min(100vw,700px)", margin: "auto" }} my="xl">
          {[
            ["https://nextjs.org/", "NextJS"],
            ["https://www.typescriptlang.org/", "TypeScript"],
            ["https://mantine.dev/", "MantineUI"],
            ["https://tabler-icons-react.vercel.app/", "Tabler Icons"],
            ["https://github.com/Web3Modal/web3modal", "Web3Modal"],
            ["https://docs.ethers.io/v5/", "Ethers"],
            ["https://hardhat.org/", "Hardhat"],
            ["https://sass-lang.com/", "SCSS"],
          ].map((c, i) => (
            <Badge key={i} size="xl" variant="outline">
              <Anchor href={c[0]}>{c[1]}</Anchor>
            </Badge>
          ))}
        </Group>

        <hr />
        <Group position="apart" my="xl">
          <Box sx={{ width: "50%" }}>
            <Title order={3}>Contract Example Provided</Title>
            <Text>
              <b>A basic counter contract:</b> deploy it to your <code>localhost</code>, and then interact with it using
              your injected wallet.
            </Text>
          </Box>
          <Box>
            <Link href="/counter" passHref>
              <Anchor>
                <Button variant="light" size="xl">
                  Counter Contract Example
                </Button>
              </Anchor>
            </Link>
          </Box>
        </Group>

        <hr />
        <Group position="apart" my="xl">
          <Box>
            <Link href="/mytoken" passHref>
              <Anchor>
                <Button variant="light" size="xl">
                  ERC-20 Token Contract Example
                </Button>
              </Anchor>
            </Link>
          </Box>
          <Box sx={{ textAlign: "right", width: "55%" }}>
            <Title order={3}>ERC-20 Token Example Provided</Title>
            <Text>
              <b>A simple ERC-20 token:</b> deploy it, transfer it around!
            </Text>
          </Box>
        </Group>
      </>
    </Layout>
  )
}

export default Home
