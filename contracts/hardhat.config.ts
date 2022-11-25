import {config as dotEnvConfig} from 'dotenv';
dotEnvConfig();

import type {HardhatUserConfig} from 'hardhat/types';

import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';
import '@nomiclabs/hardhat-etherscan';
import '@nomicfoundation/hardhat-chai-matchers';

const config: HardhatUserConfig = {
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
};

export default config;
