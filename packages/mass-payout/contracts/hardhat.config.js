"use strict";
// SPDX-License-Identifier: Apache-2.0
Object.defineProperty(exports, "__esModule", { value: true });
require("tsconfig-paths/register");
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-chai-matchers");
require("@typechain/hardhat");
require("hardhat-contract-sizer");
require("hardhat-gas-reporter");
const _configuration_1 = require("@configuration");
const config = {
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 100,
      },
      evmVersion: "london",
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test/unitTests",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337,
      blockGasLimit: 30000000,
      hardfork: "london",
    },
    local: {
      url: _configuration_1.default.endpoints.local.jsonRpc,
      accounts: _configuration_1.default.privateKeys.local,
      timeout: 60000,
    },
    previewnet: {
      url: _configuration_1.default.endpoints.previewnet.jsonRpc,
      accounts: _configuration_1.default.privateKeys.previewnet,
      timeout: 120000,
    },
    testnet: {
      url: _configuration_1.default.endpoints.testnet.jsonRpc,
      accounts: _configuration_1.default.privateKeys.testnet,
      timeout: 120000,
    },
    mainnet: {
      url: _configuration_1.default.endpoints.mainnet.jsonRpc,
      accounts: _configuration_1.default.privateKeys.mainnet,
      timeout: 120000,
    },
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: _configuration_1.default.contractSizerRunOnCompile,
    strict: true,
  },
  gasReporter: {
    enabled: _configuration_1.default.reportGas,
    showTimeSpent: true,
    outputFile: "gas-report.txt", // Force output to a file
    noColors: true, // Recommended for file output
  },
  typechain: {
    outDir: "./typechain-types",
    target: "ethers-v5",
  },
  mocha: {
    timeout: 3000000,
  },
};
exports.default = config;
