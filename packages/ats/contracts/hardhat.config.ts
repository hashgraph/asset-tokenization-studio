// SPDX-License-Identifier: Apache-2.0

import { HardhatUserConfig, task } from "hardhat/config";
import "tsconfig-paths/register";
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomicfoundation/hardhat-ethers";
import "@typechain/hardhat";
import "hardhat-contract-sizer";
import "hardhat-gas-reporter";
import "solidity-coverage";
import Configuration from "@configuration";
import "@tasks";
import "hardhat-dependency-compiler";
import "@primitivefi/hardhat-dodoc";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";

// Ensure hardhat-dependency-compiler directory exists before coverage runs.
// solidity-coverage's compile step may not trigger the plugin's hooks,
// leaving the directory absent and causing ENOENT during cleanup.
task("coverage").setAction(async (args, hre, runSuper) => {
  // solidity-coverage v0.8.x does NOT set COVERAGE — we set it here so
  // gasLimitOverride() can use a higher limit for instrumented contracts.
  process.env.COVERAGE = "true";
  const dir = join(hre.config.paths.sources, "hardhat-dependency-compiler");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return runSuper(args);
});

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
      blockGasLimit: 300_000_000,
      hardfork: "cancun",
      allowUnlimitedContractSize: true,
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
    "hedera-hashsphere": {
      url: Configuration.endpoints["hedera-hashsphere"].jsonRpc,
      accounts: Configuration.privateKeys["hedera-hashsphere"],
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
      "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol",
      "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol",
    ],
  },
  dodoc: {
    runOnCompile: false,
    outputDir: "../../../docs/ats/api/contracts",
    freshOutput: true,
    include: ["contracts"],
    exclude: ["contracts/test", "contracts/test/mocks", "node_modules", "@openzeppelin"],
  },
};

export default config;
