// SPDX-License-Identifier: Apache-2.0

/**
 * Core type definitions for the refactored ATS contracts deployment system.
 *
 * This module provides framework-agnostic types that decouple deployment logic
 * from specific blockchain frameworks (Hardhat, Foundry, etc.).
 *
 * ARCHITECTURE DECISION - Type Organization:
 * This file contains only shared infrastructure types used across multiple
 * operations and modules. Operation-specific and module-specific types are
 * defined in their respective files to keep them close to implementation.
 *
 * Guidelines for type placement:
 * - Put types HERE if:
 *   • Used by 3+ different files
 *   • Core infrastructure interfaces
 *   • Rarely changes
 *   • Fundamental to the architecture
 *
 * - Put types in operation/module files if:
 *   • Specific to one operation or module
 *   • Closely coupled to implementation details
 *   • May evolve with the feature
 *   • Complex with many properties (20+)
 *
 * This approach follows industry best practices (React, Express, TypeORM, Hardhat)
 * and prevents circular dependencies while maintaining discoverability.
 *
 * @module core/types
 */

import { Contract, ContractFactory, Signer, Wallet, Overrides, ContractReceipt, providers } from "ethers";
import type { WorkflowType } from "./types/checkpoint";

/**
 * Method definition with full signature and selector.
 *
 * Used to represent contract methods with complete type information
 * for ABI generation, debugging, and documentation.
 *
 * @example
 * ```typescript
 * {
 *   name: "grantRole",
 *   signature: "grantRole(bytes32,address)",
 *   selector: "0x2f2ff15d"
 * }
 * ```
 */
export interface MethodDefinition {
  /** Method name (e.g., "grantRole") */
  name: string;

  /** Full canonical signature (e.g., "grantRole(bytes32,address)") */
  signature: string;

  /** 4-byte function selector (e.g., "0x2f2ff15d") - keccak256(signature).slice(0, 10) */
  selector: string;
}

/**
 * Event definition with full signature and topic0 hash.
 *
 * Events are emitted by contracts to log state changes and are indexed for
 * efficient filtering and querying.
 *
 * @example
 * ```typescript
 * {
 *   name: "RoleGranted",
 *   signature: "RoleGranted(bytes32,address,address)",
 *   topic0: "0x2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d"
 * }
 * ```
 */
export interface EventDefinition {
  /** Event name (e.g., "RoleGranted") */
  name: string;

  /** Full canonical signature (e.g., "RoleGranted(bytes32,address,address)") */
  signature: string;

  /** Topic0 hash (full 32-byte keccak256) for event filtering (e.g., "0x2f8788117e7eff1d...") */
  topic0: string;
}

/**
 * Error definition with full signature and selector.
 *
 * Custom errors (Solidity 0.8.4+) provide gas-efficient error handling with
 * typed parameters.
 *
 * @example
 * ```typescript
 * {
 *   name: "InsufficientBalance",
 *   signature: "InsufficientBalance(uint256,uint256)",
 *   selector: "0xcf479181"
 * }
 * ```
 */
export interface ErrorDefinition {
  /** Error name (e.g., "InsufficientBalance") */
  name: string;

  /** Full canonical signature (e.g., "InsufficientBalance(uint256,uint256)") */
  signature: string;

  /** 4-byte error selector (e.g., "0xcf479181") - keccak256(signature).slice(0, 10) */
  selector: string;
}

/**
 * Metadata definition for a facet contract.
 *
 * SIMPLIFIED DESIGN (2025-10-03):
 * Registry contains only essential metadata. Removed fields that provided
 * zero deployment value:
 *
 * REMOVED FIELDS (and why):
 * - contractName: 100% duplicate of name (always identical)
 * - category: Never used in actual deployments (fantasy feature)
 * - layer: Meaningless for independent facets (diamond pattern has no deploy order)
 * - hasTimeTravel: Convention-based (all facets have TimeTravel variants for tests)
 * - dependencies: Always empty (facets are independent by design)
 * - roles: Always empty (never populated or used)
 * - upgradeable: Nonsense for facets (upgraded via BLR config swap, not proxy)
 *
 * Result: 76% smaller registry, zero confusion, identical functionality.
 */
export interface FacetDefinition {
  /** Facet name - used for registry key, factory lookup, and logging */
  name: string;

  /** Human-readable description for documentation and developer experience */
  description?: string;

  /** Resolver key imported or defined by this facet */
  resolverKey?: {
    /** Resolver key name (e.g., _ACCESS_CONTROL_RESOLVER_KEY) */
    name: string;
    /** Resolver key bytes32 value (e.g., 0x011768a41...) */
    value: string;
  };

  /** Number of roles defined in this facet */
  roleCount?: number;

  /** Inheritance chain (parent contracts/interfaces) */
  inheritance?: string[];

  /** Public and external methods available in this facet */
  methods?: MethodDefinition[];

  /** Events emitted by this facet */
  events?: EventDefinition[];

  /** Custom errors defined in this facet */
  errors?: ErrorDefinition[];

  /** TypeChain factory constructor function for creating contract instances */
  factory?: (signer: Signer, useTimeTravel?: boolean) => ContractFactory;
}

/**
 * Registry provider interface for dependency injection.
 *
 * Allows downstream projects to provide their own registry implementation
 * (e.g., combining ATS facets with custom facets).
 *
 * @example
 * ```typescript
 * // Downstream project with custom facets
 * const customRegistry: RegistryProvider = {
 *   getFacetDefinition: (name) => {
 *     // Try custom facets first
 *     const custom = myCustomFacets[name]
 *     if (custom) return custom
 *
 *     // Fall back to ATS registry
 *     return getFacetDefinition(name)
 *   },
 *   getAllFacets: () => {
 *     // Combine ATS and custom facets
 *     return [...getAllFacets(), ...Object.values(myCustomFacets)]
 *   }
 * }
 *
 * // Use custom registry
 * await deployFacets(provider, {
 *   facetNames: ['AccessControlFacet', 'MyCustomFacet'],
 *   registry: customRegistry
 * })
 * ```
 */
export interface RegistryProvider {
  /**
   * Get facet definition by name.
   * @param name - Facet name
   * @returns Facet definition or undefined if not found
   */
  getFacetDefinition(name: string): FacetDefinition | undefined;

  /**
   * Get all facets in the registry.
   * @returns Array of all facet definitions
   */
  getAllFacets(): FacetDefinition[];
}

/**
 * Generic contract definition (non-facet contracts like Factory, BLR).
 *
 * NOTE: Simplified along with FacetDefinition. Infrastructure contracts
 * (BLR, Factory) use proxy pattern but we don't need to track that in metadata
 * since deployment modules already know which contracts need proxies.
 */
export interface ContractDefinition {
  /** Contract name */
  name: string;

  /** Human-readable description */
  description?: string;

  /** Inheritance chain (parent contracts/interfaces) */
  inheritance?: string[];

  /** Public and external methods available in this contract */
  methods?: MethodDefinition[];

  /** Events emitted by this contract */
  events?: EventDefinition[];

  /** Custom errors defined in this contract */
  errors?: ErrorDefinition[];
}

/**
 * Storage wrapper contract definition.
 *
 * StorageWrappers are abstract contracts that provide storage and internal methods
 * for facets. They are not deployed directly but inherited by facets.
 */
export interface StorageWrapperDefinition {
  /** Storage wrapper name */
  name: string;

  /** Human-readable description */
  description?: string;

  /** Inheritance chain (parent contracts/interfaces) */
  inheritance?: string[];

  /** All methods (internal, private, public) in this storage wrapper */
  methods: MethodDefinition[];

  /** Events emitted by this storage wrapper */
  events?: EventDefinition[];

  /** Custom errors defined in this storage wrapper */
  errors?: ErrorDefinition[];
}

/**
 * Network configuration
 */
export interface NetworkConfig {
  /** Network name (e.g., 'testnet', 'mainnet') */
  name: string;

  /** JSON-RPC endpoint URL */
  jsonRpcUrl: string;

  /** Mirror node endpoint (Hedera-specific) */
  mirrorNodeUrl?: string;

  /** Chain ID */
  chainId: number;

  /** Deployed contract addresses on this network */
  addresses?: {
    [contractName: string]: {
      implementation?: string;
      proxy?: string;
      proxyAdmin?: string;
    };
  };
}

/**
 * NOTE: DeployContractOptions is defined in scripts/core/operations/deployContract.ts
 * to keep it close to the implementation. Import from there if needed.
 */

/**
 * Result of deploying a contract.
 * This type is used across multiple operations.
 */
export interface DeploymentResult {
  /** Whether deployment succeeded */
  success: boolean;

  /** Deployed contract instance (only if success=true) */
  contract?: Contract;

  /** Contract address (only if success=true) */
  address?: string;

  /** Deployment transaction hash (only if success=true) */
  transactionHash?: string;

  /** Block number where contract was deployed (only if success=true) */
  blockNumber?: number;

  /** Gas used for deployment (only if success=true) */
  gasUsed?: number;

  /** Error message (only if success=false) */
  error?: string;
}

/**
 * NOTE: DeployProxyOptions and DeployProxyResult are now defined in
 * scripts/infrastructure/operations/deployProxy.ts to keep them close to
 * the implementation. Import from there if needed.
 */

/**
 * Options for upgrading a transparent proxy to a new implementation.
 *
 * **Two Upgrade Patterns:**
 *
 * 1. Deploy and Upgrade (provide newImplementationFactory):
 *    - Deploys new implementation contract
 *    - Then upgrades proxy to point to it
 *
 * 2. Upgrade to Existing (provide newImplementationAddress):
 *    - Uses already-deployed implementation
 *    - Useful for "prepare then upgrade" pattern (deploy, test, then upgrade)
 *
 * **Must provide EITHER newImplementationFactory OR newImplementationAddress** (not both).
 *
 * @template F - Type of the factory (for type inference)
 */
export interface UpgradeProxyOptions<F extends ContractFactory = ContractFactory> {
  /** Address of the proxy contract to upgrade */
  proxyAddress: string;

  /**
   * Factory for new implementation contract (Pattern 1: Deploy and Upgrade).
   * If provided, will deploy a new implementation before upgrading.
   * Mutually exclusive with newImplementationAddress.
   */
  newImplementationFactory?: F;

  /**
   * Constructor arguments for new implementation deployment.
   * Only used when newImplementationFactory is provided.
   * These are passed to the implementation contract's constructor.
   */
  newImplementationArgs?: unknown[];

  /**
   * Address of existing implementation contract (Pattern 2: Upgrade to Existing).
   * If provided, skips deployment and upgrades to this address.
   * Mutually exclusive with newImplementationFactory.
   */
  newImplementationAddress?: string;

  /**
   * ABI-encoded initialization calldata for upgradeAndCall.
   * If provided, calls upgradeAndCall() instead of upgrade(),
   * executing this function on the proxy after upgrade.
   * Use this to reinitialize state in the new implementation.
   * Example: `interface.encodeFunctionData('initializeV2', [param])`
   */
  initData?: string;

  /** Transaction overrides (gas limit, gas price, etc.) */
  overrides?: Overrides;

  /**
   * Whether to verify contracts exist before/after upgrade.
   * Requires ProxyAdmin to be connected to a provider.
   * Default: true
   */
  verify?: boolean;
}

/**
 * Result of upgrading a proxy
 */
export interface UpgradeProxyResult {
  /** Whether upgrade succeeded */
  success: boolean;

  /** Proxy address */
  proxyAddress: string;

  /** Old implementation address */
  oldImplementation: string;

  /** New implementation address */
  newImplementation: string;

  /** Transaction hash (only if success=true) */
  transactionHash?: string;

  /** Block number (only if success=true) */
  blockNumber?: number;

  /** Gas used (only if success=true) */
  gasUsed?: number;

  /** Whether upgrade was actually performed (false if already at target implementation) */
  upgraded: boolean;

  /** Error message (only if success=false) */
  error?: string;
}

/**
 * NOTE: RegisterFacetsOptions and RegisterFacetsResult are defined in
 * scripts/core/operations/registerFacets.ts to keep them close to the implementation.
 * Import from there if needed.
 */

/**
 * Options for creating a configuration in BusinessLogicResolver
 */
export interface CreateConfigOptions {
  /** Address of BusinessLogicResolver */
  blrAddress: string;

  /** Configuration ID (bytes32) */
  configId: string;

  /** Facet IDs (in order) */
  facetIds: string[];

  /** Facet versions (corresponding to facetIds) */
  facetVersions: number[];

  /** Network */
  network?: string;

  /** Transaction overrides */
  overrides?: Overrides;
}

/**
 * Result of creating a configuration
 */
export interface CreateConfigResult {
  /** BLR address */
  blrAddress: string;

  /** Configuration ID */
  configId: string;

  /** Configuration version number */
  configVersion: number;

  /** Included facets */
  facets: Array<{
    id: string;
    version: number;
  }>;

  /** Creation transaction receipt */
  receipt: ContractReceipt;
}

/**
 * NOTE: High-level deployment module types are defined in their respective
 * module files rather than in this central types file. This design decision
 * allows modules to define specialized, feature-rich interfaces tailored to
 * their specific use cases without cluttering this core types file.
 *
 * Module-specific types (see scripts/modules/):
 * - DeployFacetsOptions/Result: scripts/modules/deployFacets.ts
 * - DeployBlrOptions/Result: scripts/modules/deployBlr.ts
 * - DeployFactoryOptions/Result: scripts/modules/deployFactory.ts
 * - DeployProxyAdminOptions/Result: scripts/modules/deployProxyAdmin.ts
 *
 * The types defined in this file are for atomic operations and core infrastructure.
 */

// ============================================================================
// Modern Error Handling Pattern (Hybrid Approach)
// ============================================================================

/**
 * Standard operation result type using discriminated unions.
 *
 * This type provides type-safe error handling for operations with expected
 * business logic failures. System errors are caught and converted to error results.
 *
 * **Pattern**: Hybrid Approach
 * - Expected failures (validation, business logic) → return error result
 * - Unexpected failures (network, system errors) → caught and converted to error result
 *
 * **Benefits**:
 * - Type-safe with discriminated unions (TypeScript enforces checking success flag)
 * - Explicit business logic failures (no hidden control flow)
 * - Preserves stack traces and error context
 * - Composable (can chain operations)
 * - Consistent with existing codebase patterns
 *
 * @template T - Success data type
 * @template E - Error code type (defaults to string for flexibility)
 *
 * @example
 * ```typescript
 * // Function returning OperationResult
 * async function deployContract(
 *   name: string
 * ): Promise<OperationResult<{ address: string }, 'INVALID_NAME' | 'DEPLOY_FAILED'>> {
 *   // Validation (expected failure)
 *   if (!name) {
 *     return { success: false, error: 'INVALID_NAME', message: 'Contract name required' }
 *   }
 *
 *   // System operations (unexpected failures caught)
 *   try {
 *     const contract = await ethers.deployContract(name)
 *     return { success: true, data: { address: contract.address } }
 *   } catch (error) {
 *     return {
 *       success: false,
 *       error: 'DEPLOY_FAILED',
 *       message: error.message,
 *       details: error
 *     }
 *   }
 * }
 *
 * // Using the result (type-safe)
 * const result = await deployContract('MyContract')
 * if (result.success) {
 *   console.log(result.data.address) // TypeScript knows data exists
 * } else {
 *   console.error(result.error, result.message) // TypeScript knows error exists
 * }
 * ```
 */
export type OperationResult<T, E extends string = string> =
  | {
      /** Operation succeeded */
      success: true;

      /** Success data */
      data: T;
    }
  | {
      /** Operation failed */
      success: false;

      /** Error code (e.g., 'INVALID_INPUT', 'TRANSACTION_FAILED') */
      error: E;

      /** Human-readable error message */
      message: string;

      /** Optional error details (original error, context, etc.) */
      details?: unknown;
    };

/**
 * Helper function to create a success result.
 *
 * @template T - Success data type
 * @param data - Success data
 * @returns Success result
 *
 * @example
 * ```typescript
 * return ok({ address: '0x123...', transactionHash: '0xabc...' })
 * ```
 */
export function ok<T>(data: T): OperationResult<T, never> {
  return { success: true, data };
}

/**
 * Helper function to create an error result.
 *
 * @template E - Error code type
 * @param error - Error code
 * @param message - Human-readable error message
 * @param details - Optional error details (original error, context, etc.)
 * @returns Error result
 *
 * @example
 * ```typescript
 * return err('INVALID_INPUT', 'Contract name is required')
 * return err('TRANSACTION_FAILED', revertReason, originalError)
 * ```
 */
export function err<E extends string>(error: E, message: string, details?: unknown): OperationResult<never, E> {
  return { success: false, error, message, details };
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ============================================================================
// Signer Creation Utilities
// ============================================================================

/**
 * Options for creating a signer from configuration.
 */
export interface SignerOptions {
  /** JSON-RPC endpoint URL */
  rpcUrl: string;

  /** Private key (with or without 0x prefix) */
  privateKey: string;

  /** Chain ID (optional) */
  chainId?: number;
}

/**
 * Create a signer from explicit configuration.
 *
 * Use this in standalone scripts (CI/CD, production deployments) where you
 * want to create a signer directly without Hardhat.
 *
 * @param options - Signer configuration
 * @returns Ethers.js Signer instance
 *
 * @example
 * ```typescript
 * import { createSigner } from '@scripts/infrastructure'
 *
 * const signer = createSigner({
 *     rpcUrl: 'https://testnet.hashio.io/api',
 *     privateKey: process.env.PRIVATE_KEY!
 * })
 *
 * const result = await deployBlr(signer, options)
 * ```
 */
export function createSigner(options: SignerOptions): Signer {
  const { rpcUrl, privateKey, chainId } = options;

  // Normalize private key (add 0x prefix if missing)
  const normalizedKey = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;

  const provider = new providers.JsonRpcProvider(rpcUrl, chainId);
  return new Wallet(normalizedKey, provider);
}

/**
 * Create a signer from environment variables.
 *
 * Reads configuration from standard environment variables:
 * - RPC_URL: JSON-RPC endpoint
 * - PRIVATE_KEY: Private key for signing transactions
 * - CHAIN_ID (optional): Network chain ID
 *
 * @returns Ethers.js Signer instance
 * @throws Error if required environment variables are missing
 *
 * @example
 * ```typescript
 * import { createSignerFromEnv } from '@scripts/infrastructure'
 *
 * // Set in environment:
 * // export RPC_URL=https://testnet.hashio.io/api
 * // export PRIVATE_KEY=0x...
 *
 * const signer = createSignerFromEnv()
 * const result = await deployCompleteSystem(signer, 'testnet')
 * ```
 */
export function createSignerFromEnv(): Signer {
  const rpcUrl = process.env.RPC_URL;
  const privateKey = process.env.PRIVATE_KEY;
  const chainId = process.env.CHAIN_ID ? parseInt(process.env.CHAIN_ID, 10) : undefined;

  if (!rpcUrl) {
    throw new Error("RPC_URL environment variable required. " + "Set it to your JSON-RPC endpoint URL.");
  }

  if (!privateKey) {
    throw new Error(
      "PRIVATE_KEY environment variable required. " + "Set it to your private key for signing transactions.",
    );
  }

  return createSigner({ rpcUrl, privateKey, chainId });
}

// ============================================================================
// Deployment Output Types
// ============================================================================

/**
 * Facet metadata in a deployment.
 */
export interface FacetMetadata {
  name: string;
  address: string;
  contractId?: string;
  key: string;
}

/**
 * Configuration metadata in a deployment.
 */
export interface ConfigurationMetadata {
  configId: string;
  version: number;
  facetCount: number;
  facets?: Array<{
    facetName: string;
    key: string;
    address: string;
  }>;
}

/**
 * Proxy update result from resolver proxy updates.
 */
export interface ProxyUpdateMetadata {
  proxyAddress: string;
  success: boolean;
  previousVersion?: number;
  newVersion?: number;
  updateType: "version" | "config" | "resolver";
  error?: string;
  transactionHash?: string;
  gasUsed?: number;
}

/**
 * Deployed contract information.
 */
export interface DeployedContractMetadata {
  address: string;
  contractId?: string;
  txHash?: string;
  gasUsed?: number;
}

/**
 * Output of deploySystemWithNewBlr workflow.
 * Creates a complete new deployment with BLR, Factory, facets, and configurations.
 *
 * This type is defined here in infrastructure layer but also exported from
 * the workflow module. They represent the same structure but are maintained
 * in both locations during the refactoring phase.
 */
export interface DeploymentOutputType {
  network: string;
  timestamp: string;
  deployer: string;
  infrastructure: {
    proxyAdmin: {
      address: string;
      contractId?: string;
    };
    blr: {
      implementation: string;
      implementationContractId?: string;
      proxy: string;
      proxyContractId?: string;
    };
    factory: {
      implementation: string;
      implementationContractId?: string;
      proxy: string;
      proxyContractId?: string;
    };
  };
  facets: FacetMetadata[];
  configurations: {
    equity: ConfigurationMetadata;
    bond: ConfigurationMetadata;
    bondFixedRate: ConfigurationMetadata;
    bondKpiLinkedRate: ConfigurationMetadata;
    bondSustainabilityPerformanceTargetRate: ConfigurationMetadata;
  };
  summary: {
    totalContracts: number;
    totalFacets: number;
    totalConfigurations: number;
    deploymentTime: number;
    gasUsed: string;
    success: boolean;
  };
  helpers: {
    getEquityFacets(): FacetMetadata[];
    getBondFacets(): FacetMetadata[];
    getBondFixedRateFacets(): FacetMetadata[];
    getBondKpiLinkedRateFacets(): FacetMetadata[];
    getBondSustainabilityPerformanceTargetRateFacets(): FacetMetadata[];
  };
}

/**
 * Output of deploySystemWithExistingBlr workflow.
 * Deploys Factory, facets, and configurations using an existing external BLR.
 */
export interface DeploymentWithExistingBlrOutputType {
  network: string;
  timestamp: string;
  deployer: string;
  infrastructure: {
    proxyAdmin: {
      address: string;
      contractId?: string;
    };
    blr: {
      implementation: string;
      implementationContractId?: string;
      proxy: string;
      proxyContractId?: string;
      isExternal: true;
    };
    factory: {
      implementation: string;
      implementationContractId?: string;
      proxy: string;
      proxyContractId?: string;
    };
  };
  facets: FacetMetadata[];
  configurations: {
    equity: ConfigurationMetadata;
    bond: ConfigurationMetadata;
  };
  summary: {
    totalContracts: number;
    totalFacets: number;
    totalConfigurations: number;
    deploymentTime: number;
    gasUsed: string;
    success: boolean;
    skippedSteps: string[];
  };
}

/**
 * Output of upgradeConfigurations workflow.
 * Deploys new facets and creates new configuration versions.
 */
export interface UpgradeConfigurationsOutputType {
  network: string;
  timestamp: string;
  deployer: string;
  blr: {
    address: string;
    isExternal: true;
  };
  facets: FacetMetadata[];
  configurations: {
    equity?: ConfigurationMetadata;
    bond?: ConfigurationMetadata;
  };
  proxyUpdates?: ProxyUpdateMetadata[];
  summary: {
    totalFacetsDeployed: number;
    configurationsCreated: number;
    proxiesUpdated: number;
    proxiesFailed: number;
    deploymentTime: number;
    gasUsed: string;
    success: boolean;
  };
}

/**
 * Output of upgradeTupProxies workflow.
 * Upgrades TUP (TransparentUpgradeableProxy) implementations via ProxyAdmin.
 */
export interface UpgradeTupProxiesOutputType {
  network: string;
  timestamp: string;
  deployer: string;
  proxyAdmin: { address: string };
  implementations?: {
    blr?: DeployedContractMetadata;
    factory?: DeployedContractMetadata;
  };
  blrUpgrade?: UpgradeProxyResult;
  factoryUpgrade?: UpgradeProxyResult;
  summary: {
    proxiesUpgraded: number;
    proxiesFailed: number;
    deploymentTime: number;
    gasUsed: string;
    success: boolean;
  };
}

/**
 * Union type for all ATS deployment outputs.
 *
 * This type represents the core ATS workflow outputs. Downstream projects
 * can use custom output types through the generic parameter in SaveDeploymentOptions.
 *
 * @example Core ATS Usage
 * ```typescript
 * const atsOutput: DeploymentOutputType = { ... }
 *
 * await saveDeploymentOutput({
 *   network: 'hedera-testnet',
 *   workflow: 'newBlr',
 *   data: atsOutput  // Full type safety and autocomplete
 * })
 * ```
 *
 * @example Downstream Extension
 * ```typescript
 * // In downstream project (e.g., GBP)
 * interface GbpInfrastructureOutput {
 *   timestamp: string;
 *   network: string;
 *   callableContracts: { ... };
 *   result: any;
 * }
 *
 * // No type constraint - any type accepted
 * await saveDeploymentOutput({
 *   network: 'hedera-testnet',
 *   workflow: 'gbpInfrastructure',
 *   data: gbpOutput  // No type assertion needed
 * })
 * ```
 */
export type AnyDeploymentOutput =
  | DeploymentOutputType
  | DeploymentWithExistingBlrOutputType
  | UpgradeConfigurationsOutputType
  | UpgradeTupProxiesOutputType;

/**
 * Options for saving a deployment output to disk.
 *
 * Generic type parameter T allows downstream projects to use custom output types
 * while preserving type safety for ATS workflows (defaults to AnyDeploymentOutput).
 */
export interface SaveDeploymentOptions<T = AnyDeploymentOutput> {
  network: string;
  workflow: WorkflowType;
  data: T;
  customPath?: string;
}

/**
 * Result of saving a deployment output to disk.
 * Discriminated union for type-safe error handling.
 */
export type SaveResult =
  | {
      success: true;
      filepath: string;
      filename: string;
    }
  | {
      success: false;
      error: string;
    };

/**
 * Options for loading a deployment output from disk.
 */
export interface LoadDeploymentOptions {
  network: string;
  workflow?: WorkflowType;
  timestamp?: string;
  useLast?: boolean;
}
