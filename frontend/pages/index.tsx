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
        <Box>
          <Link href="/testing" passHref>
            <Anchor>
              <Button variant="light" size="xl">
                Test Page
              </Button>
            </Anchor>
          </Link>
        </Box>
      </>
    </Layout>
  )
}

export default Home
