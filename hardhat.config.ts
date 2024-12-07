import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      allowBlocksWithSameTimestamp: true,
    },
    luksoTestnet: {
      url: 'https://rpc.testnet.lukso.network',
      chainId: 4201,
    },
  },
  etherscan: {
    apiKey: 'no-api-key-needed',
    customChains: [
      {
        network: 'luksoTestnet',
        chainId: 4201,
        urls: {
          apiURL: 'https://api.explorer.execution.testnet.lukso.network/api',
          browserURL: 'https://explorer.execution.testnet.lukso.network/',
        },
      },
    ],
  },
  solidity: {
    version: '0.8.17',
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  typechain: {
    outDir: 'types',
    target: 'ethers-v6',
  },
};

export default config;
