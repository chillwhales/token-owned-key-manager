import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";

// local scripts
import "./scripts/verify-all-contracts";

// config
import { HardhatUserConfig } from "hardhat/config";

// .env
import { config as loadEnv } from "dotenv";
loadEnv();

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      allowBlocksWithSameTimestamp: true,
    },
    luksoTestnet: {
      url: "https://4201.rpc.thirdweb.com",
      chainId: 4201,
      ...(process.env.DEPLOYER_PRIVATE_KEY && {
        accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      }),
    },
    luksoMainnet: {
      url: "https://42.rpc.thirdweb.com",
      chainId: 42,
      ...(process.env.DEPLOYER_PRIVATE_KEY && {
        accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      }),
    },
  },
  etherscan: {
    apiKey: "no-api-key-needed",
    customChains: [
      {
        network: "luksoTestnet",
        chainId: 4201,
        urls: {
          apiURL: "https://api.explorer.execution.testnet.lukso.network/api",
          browserURL: "https://explorer.execution.testnet.lukso.network/",
        },
      },
      {
        network: "luksoMainnet",
        chainId: 42,
        urls: {
          apiURL: "https://api.explorer.execution.mainnet.lukso.network/api",
          browserURL: "https://explorer.execution.mainnet.lukso.network/",
        },
      },
    ],
  },
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  typechain: {
    outDir: "types",
    target: "ethers-v6",
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    gasPrice: 21,
    excludeContracts: ["Helpers/"],
    src: "./contracts",
    showMethodSig: true,
  },
  namedAccounts: {
    ...(process.env.DEPLOYER_PUBLIC_KEY && {
      deployer: process.env.DEPLOYER_PUBLIC_KEY,
    }),
  },
};

export default config;
