// SPDX-License-Identifier: Apache-2.0

import { HardhatUserConfig, extendProvider, task } from "hardhat/config";
import "tsconfig-paths/register";
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-ignition-ethers";
import "@typechain/hardhat";
import "hardhat-contract-sizer";
import "hardhat-gas-reporter";
import "solidity-coverage";
import Configuration from "@configuration";
import "@tasks";
import "hardhat-dependency-compiler";
import "@primitivefi/hardhat-dodoc";
import { HardhatArtifactResolver } from "@nomicfoundation/hardhat-ignition/helpers";
import { existsSync, mkdirSync, promises as fsPromises } from "fs";
import { dirname, join } from "path";

// hardhat-ignition's artifact resolver re-reads and re-parses the build-info
// JSON — a single ~90 MB file in this project — once per contract future,
// ~115 times per full-system deploy. That added ~2 minutes of pure CPU to
// every Ignition deploy and every test-fixture deploy. Memoize the parsed
// file by path: all facets share one build info, so one read serves all.
const parsedBuildInfoByPath = new Map<string, Promise<unknown>>();
const uncachedGetBuildInfo = HardhatArtifactResolver.prototype.getBuildInfo;
HardhatArtifactResolver.prototype.getBuildInfo = async function (contractName: string) {
  const resolvePath = (
    this as unknown as { _resolvePath(name: string): Promise<string | undefined> }
  )._resolvePath.bind(this);
  const artifactPath = contractName.includes(":") ? undefined : await resolvePath(contractName);
  if (artifactPath === undefined) {
    // Fully qualified name or unknown contract: original (uncached) behavior.
    return uncachedGetBuildInfo.call(this, contractName);
  }
  const debugJson = JSON.parse(await fsPromises.readFile(artifactPath.replace(".json", ".dbg.json"), "utf8"));
  const buildInfoPath = join(dirname(artifactPath), debugJson.buildInfo);
  let parsed = parsedBuildInfoByPath.get(buildInfoPath);
  if (parsed === undefined) {
    parsed = fsPromises.readFile(buildInfoPath, "utf8").then(JSON.parse);
    parsedBuildInfoByPath.set(buildInfoPath, parsed);
  }
  return parsed as ReturnType<typeof uncachedGetBuildInfo>;
};

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

// Hedera JSON-RPC relay: eth_estimateGas and eth_call simulate against mirror-node
// state, which lags consensus by seconds — retry with backoff and, for estimateGas
// only, fall back to a fixed limit when the lag outlasts every retry.
extendProvider(async (provider, _config, network) => {
  if (!network.startsWith("hedera")) return provider;

  const SIMULATION_METHODS = new Set(["eth_estimateGas", "eth_call"]);
  // ~90s total: mirror-node lag under load has been observed to exceed 15s.
  const RETRY_DELAYS_MS = [3_000, 6_000, 9_000, 12_000, 15_000, 15_000, 15_000, 15_000];
  const ESTIMATE_GAS_FALLBACK = "0xe4e1c0"; // 15,000,000

  return new Proxy(provider, {
    get(target, prop, receiver) {
      if (prop !== "request") return Reflect.get(target, prop, receiver);
      return async (args: { method: string; params?: unknown[] }) => {
        if (!SIMULATION_METHODS.has(args.method)) return target.request(args);
        let lastError: unknown;
        for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
          if (attempt > 0) {
            console.warn(`${args.method} reverted (mirror-node lag?), retry ${attempt}/${RETRY_DELAYS_MS.length}...`);
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt - 1]));
          }
          try {
            return await target.request(args);
          } catch (err) {
            lastError = err;
            const message = err instanceof Error ? err.message : String(err);
            if (!/revert|FAIL_INVALID|CONTRACT_REVERT_EXECUTED/i.test(message)) throw err;
          }
        }
        if (args.method === "eth_estimateGas") {
          console.warn(
            `eth_estimateGas still reverting after retries — using fixed ${ESTIMATE_GAS_FALLBACK} gas (legacy Hedera behavior)`,
          );
          return ESTIMATE_GAS_FALLBACK;
        }
        throw lastError;
      };
    },
  });
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
          evmVersion: "paris",
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
  // Ignition polls for new blocks between futures (default 1000 ms).
  ignition: {
    blockPollingInterval: (process.env.HARDHAT_NETWORK ?? process.argv[process.argv.indexOf("--network") + 1] ?? "")
      .toString()
      .startsWith("hedera-")
      ? 1000
      : 50,
  },
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
    "besu-iob": {
      url: "https://rpc.besunetwork.iob.zone",
      accounts: ["0x51078a7bcf6ee92ae0b3034d32a6abebbe8d26fa2b7ecc690140801ea6a213c8"],
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
  },
  dependencyCompiler: {
    paths: [
      "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol",
      "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol",
    ],
  },
  dodoc: {
    runOnCompile: false,
    outputDir: "./docs/api/contracts",
    freshOutput: true,
    include: ["contracts"],
    exclude: ["contracts/test", "contracts/test/mocks", "node_modules", "@openzeppelin"],
  },
};

export default config;
