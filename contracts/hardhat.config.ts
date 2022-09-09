import {config as dotEnvConfig} from 'dotenv';
dotEnvConfig();

import type {HardhatUserConfig} from 'hardhat/types';

import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';
import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-solhint';
import 'solidity-coverage';

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

const config: HardhatUserConfig & {
  etherscan: {apiKey: string | undefined};
} = {
  defaultNetwork: 'hardhat',
  solidity: {
    compilers: [{version: '0.8.9', settings: {}}],
  },
  // redirect typechain output for the frontend
  typechain: {
    outDir: './types/typechain',
  },
  networks: {
    hardhat: {},
    localhost: {},
  },
  etherscan: {
    // Your API key for Etherscan (from https://etherscan.io/)
    apiKey: ETHERSCAN_API_KEY,
  },
};

export default config;
