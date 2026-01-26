// SPDX-License-Identifier: Apache-2.0

import dotenv from "dotenv";

// Load the `.env` file
dotenv.config();

const EMPTY_STRING = "";
const NETWORK_ENV_PREFIX_SEPARATOR_REGEX = /-/g;

// ============================================================================
// DEPRECATION NOTICE
// ============================================================================
/**
 * @deprecated Configuration.ts is being phased out in favor of modular
 * scripts/core modules. For new code, use:
 * - scripts/core/constants.ts for network constants and defaults
 * - scripts/core/config.ts for network configuration
 * - scripts/core/registry.ts for contract metadata
 *
 * This file will continue to work for backward compatibility but will be
 * marked as legacy in future releases.
 */

/**
 * Supported networks for ATS contract deployment.
 *
 * Network Types:
 * - hardhat: Hardhat's in-memory test network (ephemeral, no persistence)
 * - local: Generic local Ethereum node (e.g., Hardhat node, Ganache, Anvil)
 * - hedera-local: Local Hedera node running in Docker
 * - hedera-previewnet: Hedera previewnet (public test network)
 * - hedera-testnet: Hedera testnet (primary test network)
 * - hedera-mainnet: Hedera mainnet (production network)
 */
export const NETWORKS = [
  "hardhat",
  "local",
  "hedera-local",
  "hedera-previewnet",
  "hedera-testnet",
  "hedera-mainnet",
] as const;
export type Network = (typeof NETWORKS)[number];

/**
 * Normalizes network identifiers to environment variable prefixes.
 *
 * Converts network names like `hedera-testnet` to `HEDERA_TESTNET` so they
 * map to valid environment variable keys (e.g. `HEDERA_TESTNET_PRIVATE_KEY_0`).
 */
const formatNetworkEnvPrefix = (network: Network): string =>
  network.toUpperCase().replace(NETWORK_ENV_PREFIX_SEPARATOR_REGEX, "_");

/**
 * Backward compatibility aliases for network names.
 * Maps old network names to new standardized names.
 *
 * @deprecated Old network names. Use new names from NETWORKS instead.
 */
export const NETWORK_ALIASES: Record<string, Network> = {
  localhost: "local",
  previewnet: "hedera-previewnet",
  testnet: "hedera-testnet",
  mainnet: "hedera-mainnet",
};

export const DEPLOY_TYPES = ["proxy", "direct"] as const;
export type DeployType = (typeof DEPLOY_TYPES)[number];

export const CONTRACT_NAMES = [
  "TransparentUpgradeableProxy",
  "ProxyAdmin",
  "Factory",
  "BusinessLogicResolver",
  "AccessControlFacet",
  "CapFacet",
  "ControlListFacet",
  "PauseFacet",
  "ERC20Facet",
  "ERC20PermitFacet",
  "ERC1410ScheduledTasksFacet",
  "ERC20Votes", //TODO
  "ERC1410ReadFacet",
  "ERC1410ManagementFacet",
  "ERC1410IssuerFacet",
  "ERC1410TokenHolderFacet",
  "ERC1594Facet",
  "ERC1643Facet",
  "ERC1644Facet",
  "DiamondFacet",
  "EquityUSAFacet",
  "BondUSAFacet",
  "BondUSARead", //TODO
  "ScheduledSnapshotsFacet",
  "ScheduledBalanceAdjustmentsFacet",
  "ScheduledCrossOrderedTasksFacet",
  "ScheduledCouponListingFacet",
  "SnapshotsFacet",
  "CorporateActionsFacet",
  "TransferAndLockFacet",
  "LockFacet",
  "AdjustBalancesFacet",
  "ProtectedPartitionsFacet",
  "HoldReadFacet",
  "HoldTokenHolderFacet",
  "HoldManagementFacet",
  "TimeTravel",
  "KycFacet",
  "SsiManagementFacet",
  "ClearingHoldCreationFacet",
  "ClearingRedeemFacet",
  "ClearingTransferFacet",
  "ClearingReadFacet",
  "ClearingActionsFacet",
  "ProceedRecipientsFacet",
  "ExternalPauseManagementFacet",
  "ExternalControlListManagementFacet",
  "ExternalKycListManagementFacet",
  "ERC3643",
  "FreezeFacet",
  "ERC3643ManagementFacet",
  "ERC3643ReadFacet",
  "ERC3643OperationsFacet",
  "ERC3643BatchFacet",
  "FreezeFacet",
  "TREXFactoryAts",
  "ComplianceMock",
  "IdentityRegistryMock",
  "IdFactory",
  "ClaimTopicsRegistry",
  "IdentityRegistryStorage",
  "IdentityRegistry",
  "ModularCompliance",
  "TrustedIssuersRegistry",
  "TREXImplementationAuthority",
  "ImplementationAuthority",
  "Identity",
] as const;
export type ContractName = (typeof CONTRACT_NAMES)[number];

export const LIBRARY_NAMES = [
  "SecurityDeploymentLib",
  "TREXBaseDeploymentLib",
  "TREXBondDeploymentLib",
  "TREXEquityDeploymentLib",
] as const;
export type LibraryName = (typeof LIBRARY_NAMES)[number];

export const CONTRACT_NAMES_WITH_PROXY = ["Factory", "BusinessLogicResolver"];

export const CONTRACT_FACTORY_NAMES = CONTRACT_NAMES.map((name) => `${name}__factory`);
export type ContractFactoryName = (typeof CONTRACT_FACTORY_NAMES)[number];

export interface Endpoints {
  jsonRpc: string;
  mirror: string;
}

export interface DeployedContract {
  address: string;
  proxyAddress?: string;
  proxyAdminAddress?: string;
}

export interface ContractConfig {
  name: ContractName;
  factoryName: ContractFactoryName;
  deployType: DeployType;
  addresses?: Record<Network, DeployedContract>;
}

export default class Configuration {
  // private _privateKeys: Record<Network, string[]>;
  // private _endpoints: Record<Network, Endpoints>;
  // private _contracts: Record<ContractName, ContractConfig>;
  /**
   * Determines whether the contract sizer should run on compile.
   *
   * @returns {boolean} True if the contract sizer should run on compile, false otherwise.
   */
  public static get contractSizerRunOnCompile(): boolean {
    return (
      Configuration._getEnvironmentVariable({
        name: "CONTRACT_SIZER_RUN_ON_COMPILE",
        defaultValue: "true",
      }).toLowerCase() === "true"
    );
  }

  /**
   * Determines whether gas reporting is enabled.
   *
   * @returns {boolean} True if gas reporting is enabled, false otherwise.
   */
  public static get reportGas(): boolean {
    return (
      Configuration._getEnvironmentVariable({
        name: "REPORT_GAS",
        defaultValue: "true",
      }).toLowerCase() === "true"
    );
  }

  public static get privateKeys(): Record<Network, string[]> {
    return NETWORKS.reduce(
      (result, network) => {
        const envPrefix = formatNetworkEnvPrefix(network);
        result[network] = Configuration._getEnvironmentVariableList({
          name: `${envPrefix}_PRIVATE_KEY_#`,
        });
        return result;
      },
      {} as Record<Network, string[]>,
    );
  }

  public static get endpoints(): Record<Network, Endpoints> {
    return NETWORKS.reduce(
      (result, network) => {
        result[network] = {
          jsonRpc: Configuration._getEnvironmentVariable({
            name: `${network.toUpperCase().replace(/-/g, "_")}_JSON_RPC_ENDPOINT`,
            defaultValue:
              network === "local"
                ? "http://127.0.0.1:8545"
                : network === "hedera-local"
                  ? "http://127.0.0.1:7546"
                  : network === "hardhat"
                    ? ""
                    : `https://${network.replace("hedera-", "")}.hashio.io/api`,
          }),
          mirror: Configuration._getEnvironmentVariable({
            name: `${network.toUpperCase().replace(/-/g, "_")}_MIRROR_NODE_ENDPOINT`,
            defaultValue:
              network === "local"
                ? ""
                : network === "hedera-local"
                  ? "http://127.0.0.1:5600"
                  : network === "hardhat"
                    ? ""
                    : `https://${network.replace("hedera-", "")}.mirrornode.hedera.com`,
          }),
        };
        return result;
      },
      {} as Record<Network, Endpoints>,
    );
  }

  public static get contracts(): Record<ContractName, ContractConfig> {
    const contracts: Record<ContractName, ContractConfig> = {} as Record<ContractName, ContractConfig>;
    CONTRACT_NAMES.forEach((contractName) => {
      contracts[contractName] = {
        name: contractName,
        factoryName: `${contractName}__factory`,
        deployType: CONTRACT_NAMES_WITH_PROXY.includes(contractName) ? "proxy" : "direct",
        addresses: Configuration._getDeployedAddresses({
          contractName,
        }),
      };
    });
    return contracts;
  }

  // * Private methods

  /**
   * Retrieves the deployed contract addresses for a given contract name across different networks.
   *
   * @param {Object} params - The parameters object.
   * @param {ContractName} params.contractName - The name of the contract to get deployed addresses for.
   * @returns {Record<Network, DeployedContract>} An object mapping each network to its deployed contract details.
   *
   * The function iterates over all available networks and fetches the contract address, proxy address,
   * and proxy admin address from environment variables. If the contract address is found, it adds the
   * details to the returned object.
   */
  private static _getDeployedAddresses({
    contractName,
  }: {
    contractName: ContractName;
  }): Record<Network, DeployedContract> {
    const deployedAddresses: Record<Network, DeployedContract> = {} as Record<Network, DeployedContract>;

    NETWORKS.forEach((network) => {
      const address = Configuration._getEnvironmentVariable({
        name: `${network.toUpperCase()}_${contractName.toUpperCase()}`,
        defaultValue: EMPTY_STRING,
      });

      if (address !== EMPTY_STRING) {
        const proxyAddress = Configuration._getEnvironmentVariable({
          name: `${network.toUpperCase()}_${contractName}_PROXY`,
          defaultValue: EMPTY_STRING,
        });
        const proxyAdminAddress = Configuration._getEnvironmentVariable({
          name: `${network.toUpperCase()}_${contractName}_PROXY_ADMIN`,
          defaultValue: EMPTY_STRING,
        });

        deployedAddresses[network] = {
          address,
          ...(proxyAddress !== EMPTY_STRING && { proxyAddress }),
          ...(proxyAdminAddress !== EMPTY_STRING && {
            proxyAdminAddress,
          }),
        };
      }
    });

    return deployedAddresses;
  }

  private static _getEnvironmentVariableList({
    name,
    indexChar = "#",
  }: {
    name: string;
    indexChar?: string;
  }): string[] {
    const resultList: string[] = [];
    let index = 0;
    do {
      const env = Configuration._getEnvironmentVariable({
        name: name.replace(indexChar, `${index}`),
        defaultValue: EMPTY_STRING,
      });
      if (env !== EMPTY_STRING) {
        resultList.push(env);
      }
      index++;
    } while (resultList.length === index);
    return resultList;
  }

  private static _getEnvironmentVariable({ name, defaultValue }: { name: string; defaultValue?: string }): string {
    const value = process.env?.[name];
    if (value) {
      return value;
    }
    if (defaultValue !== undefined) {
      // console.warn(
      //     `🟠 Environment variable ${name} is not defined, Using default value: ${defaultValue}`
      // )
      return defaultValue;
    }
    throw new Error(`Environment variable "${name}" is not defined. Please set the "${name}" environment variable.`);
  }
}
