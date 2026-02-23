// SPDX-License-Identifier: Apache-2.0

import { HardhatUserConfig } from "hardhat/config";
import "tsconfig-paths/register";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import "@typechain/hardhat";
import "hardhat-contract-sizer";
import "hardhat-gas-reporter";
import "solidity-coverage";
import Configuration from "@configuration";

import "hardhat/types/config";
import "@primitivefi/hardhat-dodoc";

declare module "hardhat/types/config" {
  interface HardhatNetworkUserConfig {
    assetAddresses?: string[];
    usdcAddress?: string;
  }
}

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.22",
        settings: {
          optimizer: {
            enabled: true,
            runs: 100,
          },
          evmVersion: "london",
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337,
      blockGasLimit: 30_000_000,
      hardfork: "london",
    },
    local: {
      url: Configuration.endpoints.local.jsonRpc,
      accounts: Configuration.privateKeys.local,
      timeout: 60_000,
    },
    previewnet: {
      url: Configuration.endpoints.previewnet.jsonRpc,
      accounts: Configuration.privateKeys.previewnet,
      timeout: 120_000,
    },
    testnet: {
      url: Configuration.endpoints.testnet.jsonRpc,
      accounts: Configuration.privateKeys.testnet,
      assetAddresses: Configuration.assetAddresses.testnet,
      usdcAddress: Configuration.usdcAddresses.testnet,
      timeout: 120_000,
    },
    mainnet: {
      url: Configuration.endpoints.mainnet.jsonRpc,
      accounts: Configuration.privateKeys.mainnet,
      timeout: 120_000,
    },
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: Configuration.contractSizerRunOnCompile,
    strict: true,
  },
  gasReporter: {
    enabled: Configuration.reportGas,
    showTimeSpent: true,
    outputFile: "gas-report.txt", // Force output to a file
    noColors: true, // Recommended for file output
  },
  typechain: {
    outDir: "./typechain-types",
    target: "ethers-v6",
  },
  mocha: {
    timeout: 3_000_000,
  },
  dodoc: {
    runOnCompile: false,
    outputDir: "./docs/api",
    freshOutput: true,
    include: ["contracts"],
    exclude: ["contracts/test", "contracts/mocks", "node_modules"],
  },
};

export default config;
