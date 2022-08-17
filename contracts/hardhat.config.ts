import { config as dotEnvConfig } from "dotenv"
dotEnvConfig()

import type { HardhatUserConfig } from "hardhat/types"

// hardhat stuff
import "@nomiclabs/hardhat-ethers"
import "@nomiclabs/hardhat-etherscan"
import "@nomiclabs/hardhat-solhint"
import "@nomicfoundation/hardhat-chai-matchers"

// generate typings
import "@typechain/hardhat"

// gas reporing
import "hardhat-gas-reporter"

// test coverage
import "solidity-coverage"

const RINKEBY_INFURA_PROJECT_ID = process.env.RINKEBY_INFURA_PROJECT_ID || ""
const RINKEBY_PRIVATE_KEY =
  process.env.RINKEBY_PRIVATE_KEY! || "0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3" // well known private key
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY

const config: HardhatUserConfig & {
  etherscan: { apiKey: string | undefined }
} = {
  defaultNetwork: "hardhat",
  solidity: {
    compilers: [{ version: "0.8.9", settings: {} }],
  },
  // redirect typechain output for the frontend
  typechain: {
    outDir: "./types/typechain",
  },
  gasReporter: {
    enabled: false,
  },
  networks: {
    hardhat: {},
    localsubnet: {
      url: "http://127.0.0.1:9656/ext/bc/XqhB3v8RojT6JkpofFcDRiACdzSCiiTzo2zWqhhUu4FJ6N53A/rpc",
      chainId: 191192,
      accounts: ["0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027"],
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${RINKEBY_INFURA_PROJECT_ID}`,
      accounts: [RINKEBY_PRIVATE_KEY],
    },
    coverage: {
      url: "http://127.0.0.1:8555", // Coverage launches its own ganache-cli client
    },
  },
  etherscan: {
    // Your API key for Etherscan (from https://etherscan.io/)
    apiKey: ETHERSCAN_API_KEY,
  },
}

export default config
