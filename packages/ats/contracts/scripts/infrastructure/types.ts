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
 *   • Core infrastructure or interfaces (e.g., DeploymentProvider)
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

import {
    Contract,
    ContractFactory,
    Signer,
    Overrides,
    ContractReceipt,
    providers,
} from 'ethers'

/**
 * Framework-agnostic deployment provider interface.
 * Allows scripts to work with any Ethereum provider (Hardhat, Ethers, Viem, etc.)
 */
export interface DeploymentProvider {
    /**
     * Get a signer for transactions
     * @returns Promise resolving to a Signer instance
     */
    getSigner(): Promise<Signer>

    /**
     * Get a contract factory by name
     * @param contractName - Name of the contract (e.g., 'AccessControlFacet')
     * @returns Promise resolving to a ContractFactory
     */
    getFactory(contractName: string): Promise<ContractFactory>

    /**
     * Deploy a contract
     * @param factory - Contract factory
     * @param args - Constructor arguments
     * @param overrides - Transaction overrides (gas, gasPrice, etc.)
     * @returns Promise resolving to deployed Contract instance
     */
    deploy(
        factory: ContractFactory,
        args?: any[],
        overrides?: Overrides
    ): Promise<Contract>

    /**
     * Deploy a TransparentUpgradeableProxy
     * @param implementationAddress - Address of implementation contract
     * @param proxyAdminAddress - Address of ProxyAdmin
     * @param initData - Initialization data (encoded function call)
     * @param overrides - Transaction overrides
     * @returns Promise resolving to deployed proxy Contract
     */
    deployProxy(
        implementationAddress: string,
        proxyAdminAddress: string,
        initData: string,
        overrides?: Overrides
    ): Promise<Contract>

    /**
     * Upgrade a proxy implementation
     * @param proxyAddress - Address of the proxy to upgrade
     * @param newImplementationAddress - Address of new implementation
     * @param proxyAdminAddress - Address of ProxyAdmin
     * @param overrides - Transaction overrides
     * @returns Promise resolving when upgrade is complete
     */
    upgradeProxy(
        proxyAddress: string,
        newImplementationAddress: string,
        proxyAdminAddress: string,
        overrides?: Overrides
    ): Promise<void>

    /**
     * Get provider for read operations
     * @returns Provider instance for reading blockchain state
     */
    getProvider(): providers.Provider
}

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
    name: string

    /** Full canonical signature (e.g., "grantRole(bytes32,address)") */
    signature: string

    /** 4-byte function selector (e.g., "0x2f2ff15d") - keccak256(signature).slice(0, 10) */
    selector: string
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
    name: string

    /** Full canonical signature (e.g., "RoleGranted(bytes32,address,address)") */
    signature: string

    /** Topic0 hash (full 32-byte keccak256) for event filtering (e.g., "0x2f8788117e7eff1d...") */
    topic0: string
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
    name: string

    /** Full canonical signature (e.g., "InsufficientBalance(uint256,uint256)") */
    signature: string

    /** 4-byte error selector (e.g., "0xcf479181") - keccak256(signature).slice(0, 10) */
    selector: string
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
    name: string

    /** Human-readable description for documentation and developer experience */
    description?: string

    /** Resolver key imported or defined by this facet */
    resolverKey?: {
        /** Resolver key name (e.g., _ACCESS_CONTROL_RESOLVER_KEY) */
        name: string
        /** Resolver key bytes32 value (e.g., 0x011768a41...) */
        value: string
    }

    /** Number of roles defined in this facet */
    roleCount?: number

    /** Inheritance chain (parent contracts/interfaces) */
    inheritance?: string[]

    /** Public and external methods available in this facet */
    methods?: MethodDefinition[]

    /** Events emitted by this facet */
    events?: EventDefinition[]

    /** Custom errors defined in this facet */
    errors?: ErrorDefinition[]
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
    getFacetDefinition(name: string): FacetDefinition | undefined

    /**
     * Get all facets in the registry.
     * @returns Array of all facet definitions
     */
    getAllFacets(): FacetDefinition[]
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
    name: string

    /** Human-readable description */
    description?: string

    /** Inheritance chain (parent contracts/interfaces) */
    inheritance?: string[]

    /** Public and external methods available in this contract */
    methods?: MethodDefinition[]

    /** Events emitted by this contract */
    events?: EventDefinition[]

    /** Custom errors defined in this contract */
    errors?: ErrorDefinition[]
}

/**
 * Storage wrapper contract definition.
 *
 * StorageWrappers are abstract contracts that provide storage and internal methods
 * for facets. They are not deployed directly but inherited by facets.
 */
export interface StorageWrapperDefinition {
    /** Storage wrapper name */
    name: string

    /** Human-readable description */
    description?: string

    /** Inheritance chain (parent contracts/interfaces) */
    inheritance?: string[]

    /** All methods (internal, private, public) in this storage wrapper */
    methods: MethodDefinition[]

    /** Events emitted by this storage wrapper */
    events?: EventDefinition[]

    /** Custom errors defined in this storage wrapper */
    errors?: ErrorDefinition[]
}

/**
 * Network configuration
 */
export interface NetworkConfig {
    /** Network name (e.g., 'testnet', 'mainnet') */
    name: string

    /** JSON-RPC endpoint URL */
    jsonRpcUrl: string

    /** Mirror node endpoint (Hedera-specific) */
    mirrorNodeUrl?: string

    /** Chain ID */
    chainId: number

    /** Deployed contract addresses on this network */
    addresses?: {
        [contractName: string]: {
            implementation?: string
            proxy?: string
            proxyAdmin?: string
        }
    }
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
    success: boolean

    /** Deployed contract instance (only if success=true) */
    contract?: Contract

    /** Contract address (only if success=true) */
    address?: string

    /** Deployment transaction hash (only if success=true) */
    transactionHash?: string

    /** Block number where contract was deployed (only if success=true) */
    blockNumber?: number

    /** Gas used for deployment (only if success=true) */
    gasUsed?: number

    /** Error message (only if success=false) */
    error?: string
}

/**
 * Options for deploying a proxy
 */
export interface DeployProxyOptions {
    /** Contract name for implementation */
    implementationContract: string

    /** Constructor args for implementation */
    implementationArgs?: any[]

    /** Address of implementation (if already deployed) */
    implementationAddress?: string

    /** Address of existing ProxyAdmin (if reusing) */
    proxyAdminAddress?: string

    /** Initialization data (encoded function call) */
    initData?: string

    /** Network to deploy to */
    network?: string

    /** Transaction overrides */
    overrides?: Overrides

    /** Whether to verify contracts after deployment */
    verify?: boolean
}

/**
 * Result of deploying a proxy
 */
export interface DeployProxyResult {
    /** Implementation contract instance */
    implementation: Contract

    /** Implementation address */
    implementationAddress: string

    /** Proxy contract instance */
    proxy: Contract

    /** Proxy address */
    proxyAddress: string

    /** ProxyAdmin contract instance */
    proxyAdmin: Contract

    /** ProxyAdmin address */
    proxyAdminAddress: string

    /** Deployment transaction receipts */
    receipts: {
        implementation?: ContractReceipt
        proxy?: ContractReceipt
        proxyAdmin?: ContractReceipt
    }
}

/**
 * Options for upgrading a proxy
 */
export interface UpgradeProxyOptions {
    /** Proxy address to upgrade */
    proxyAddress: string

    /** New implementation contract name */
    newImplementationContract: string

    /** Constructor args for new implementation */
    newImplementationArgs?: any[]

    /** Address of new implementation (if already deployed) */
    newImplementationAddress?: string

    /** ProxyAdmin address (optional, will be read from proxy if not provided) */
    proxyAdminAddress?: string

    /** Initialization data to call after upgrade */
    initData?: string

    /** Network */
    network?: string

    /** Transaction overrides */
    overrides?: Overrides

    /** Whether to verify upgrade succeeded */
    verify?: boolean
}

/**
 * Result of upgrading a proxy
 */
export interface UpgradeProxyResult {
    /** Whether upgrade succeeded */
    success: boolean

    /** Proxy address */
    proxyAddress: string

    /** Old implementation address */
    oldImplementation: string

    /** New implementation address */
    newImplementation: string

    /** Transaction hash (only if success=true) */
    transactionHash?: string

    /** Block number (only if success=true) */
    blockNumber?: number

    /** Gas used (only if success=true) */
    gasUsed?: number

    /** Whether upgrade was actually performed (false if already at target implementation) */
    upgraded: boolean

    /** Error message (only if success=false) */
    error?: string
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
    blrAddress: string

    /** Configuration ID (bytes32) */
    configId: string

    /** Facet IDs (in order) */
    facetIds: string[]

    /** Facet versions (corresponding to facetIds) */
    facetVersions: number[]

    /** Network */
    network?: string

    /** Transaction overrides */
    overrides?: Overrides
}

/**
 * Result of creating a configuration
 */
export interface CreateConfigResult {
    /** BLR address */
    blrAddress: string

    /** Configuration ID */
    configId: string

    /** Configuration version number */
    configVersion: number

    /** Included facets */
    facets: Array<{
        id: string
        version: number
    }>

    /** Creation transaction receipt */
    receipt: ContractReceipt
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
          success: true

          /** Success data */
          data: T
      }
    | {
          /** Operation failed */
          success: false

          /** Error code (e.g., 'INVALID_INPUT', 'TRANSACTION_FAILED') */
          error: E

          /** Human-readable error message */
          message: string

          /** Optional error details (original error, context, etc.) */
          details?: unknown
      }

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
    return { success: true, data }
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
export function err<E extends string>(
    error: E,
    message: string,
    details?: unknown
): OperationResult<never, E> {
    return { success: false, error, message, details }
}

export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}
