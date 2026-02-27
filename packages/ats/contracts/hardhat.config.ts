// SPDX-License-Identifier: Apache-2.0

import { HardhatUserConfig } from "hardhat/config";
import "tsconfig-paths/register";
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomicfoundation/hardhat-ethers";
import "@typechain/hardhat";
import "hardhat-contract-sizer";
import "hardhat-gas-reporter";
import Configuration from "@configuration";
import "@tasks";
import "hardhat-dependency-compiler";
import "@primitivefi/hardhat-dodoc";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 100,
          },
          evmVersion: "cancun",
        },
      },
      {
        version: "0.8.17",
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
    tests: "./test/contracts/integration",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337,
      blockGasLimit: 30_000_000,
      hardfork: "cancun",
    },
    local: {
      url: Configuration.endpoints.local.jsonRpc,
      accounts: Configuration.privateKeys.local,
      timeout: 60_000,
    },
    "hedera-local": {
      url: Configuration.endpoints["hedera-local"].jsonRpc,
      accounts: Configuration.privateKeys["hedera-local"],
      timeout: 60_000,
    },
    "hedera-previewnet": {
      url: Configuration.endpoints["hedera-previewnet"].jsonRpc,
      accounts: Configuration.privateKeys["hedera-previewnet"],
      timeout: 120_000,
    },
    "hedera-testnet": {
      url: Configuration.endpoints["hedera-testnet"].jsonRpc,
      accounts: Configuration.privateKeys["hedera-testnet"],
      timeout: 120_000,
    },
    "hedera-mainnet": {
      url: Configuration.endpoints["hedera-mainnet"].jsonRpc,
      accounts: Configuration.privateKeys["hedera-mainnet"],
      timeout: 120_000,
    },
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: Configuration.contractSizerRunOnCompile,
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
    require: ["./test/helpers/globalSetup.ts"],
    rootHooks: {
      beforeAll() {
        // Direct require to avoid barrel import (prevents eager typechain loading)
        const { configureLogger, LogLevel } = require("./scripts/infrastructure/utils/logging");
        configureLogger({ level: LogLevel.SILENT });
      },
    },
  },
  dependencyCompiler: {
    paths: [
      "@tokenysolutions/t-rex/contracts/registry/implementation/ClaimTopicsRegistry.sol",
      "@tokenysolutions/t-rex/contracts/registry/implementation/TrustedIssuersRegistry.sol",
      "@tokenysolutions/t-rex/contracts/registry/implementation/IdentityRegistryStorage.sol",
      "@tokenysolutions/t-rex/contracts/registry/implementation/IdentityRegistry.sol",
      "@tokenysolutions/t-rex/contracts/compliance/modular/ModularCompliance.sol",
      "@tokenysolutions/t-rex/contracts/proxy/authority/TREXImplementationAuthority.sol",
      "@tokenysolutions/t-rex/contracts/factory/TREXFactory.sol",
      "@tokenysolutions/t-rex/contracts/proxy/ClaimTopicsRegistryProxy.sol",
      "@tokenysolutions/t-rex/contracts/proxy/IdentityRegistryProxy.sol",
      "@tokenysolutions/t-rex/contracts/proxy/IdentityRegistryStorageProxy.sol",
      "@tokenysolutions/t-rex/contracts/proxy/ModularComplianceProxy.sol",
      "@tokenysolutions/t-rex/contracts/compliance/legacy/DefaultCompliance.sol",
      "@onchain-id/solidity/contracts/Identity.sol",
      "@onchain-id/solidity/contracts/ClaimIssuer.sol",
    ],
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
