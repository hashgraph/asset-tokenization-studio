// SPDX-License-Identifier: Apache-2.0

/**
 * Network configuration module for ATS deployment system.
 *
 * This module provides network configuration by integrating with the existing
 * Configuration.ts (single source of truth) with Zod runtime validation.
 *
 * Modern approach:
 * - Configuration.ts reads from environment variables
 * - This module wraps it with type-safe API and runtime validation
 * - Zod schemas provide helpful error messages
 *
 * @module core/config
 */

import { z } from 'zod'
import Configuration, { NETWORK_ALIASES } from '@configuration'
import type { Endpoints } from '@configuration'
import type { NetworkConfig } from '@scripts/infrastructure/types'
import { CHAIN_IDS } from '@scripts/infrastructure/constants'

/**
 * Zod schema for network configuration.
 * Provides runtime validation with helpful error messages.
 */
const NetworkConfigSchema = z.object({
    name: z.string().min(1, 'Network name cannot be empty'),
    jsonRpcUrl: z
        .string()
        .refine(
            (url) => url === '' || z.string().url().safeParse(url).success,
            'Invalid JSON-RPC URL format'
        ),
    mirrorNodeUrl: z
        .string()
        .refine(
            (url) => url === '' || z.string().url().safeParse(url).success,
            'Invalid mirror node URL format'
        )
        .optional(),
    chainId: z.number().positive('Chain ID must be positive'),
})

/**
 * Get chain ID for a network.
 *
 * @param network - Network name
 * @returns Chain ID for the network
 */
function getChainId(network: string): number {
    return CHAIN_IDS[network] || 1337
}

/**
 * Get network configuration by name.
 *
 * Integrates with Configuration.ts to read endpoints from environment variables
 * with Zod runtime validation for type safety and helpful error messages.
 *
 * Supports backward compatibility via NETWORK_ALIASES:
 * - 'local' → 'localhost'
 * - 'testnet' → 'hedera-testnet'
 * - 'mainnet' → 'hedera-mainnet'
 * - 'previewnet' → 'hedera-previewnet'
 *
 * @param network - Network identifier (e.g., 'hedera-testnet', 'testnet', 'mainnet')
 * @returns NetworkConfig with endpoints and chain ID
 * @throws Error if network not found, misconfigured, or validation fails
 *
 * @example
 * ```typescript
 * // New network names
 * const testnetConfig = getNetworkConfig('hedera-testnet')
 *
 * // Old names still work (backward compatible)
 * const testnetConfig2 = getNetworkConfig('testnet') // Resolves to hedera-testnet
 *
 * console.log(testnetConfig.jsonRpcUrl)   // From HEDERA_TESTNET_JSON_RPC_ENDPOINT env var
 * console.log(testnetConfig.mirrorNodeUrl) // From HEDERA_TESTNET_MIRROR_NODE_ENDPOINT env var
 * console.log(testnetConfig.chainId)       // 296 for hedera-testnet
 * ```
 */
export function getNetworkConfig(network: string): NetworkConfig {
    // Resolve alias if provided (backward compatibility)
    const resolvedNetwork = (NETWORK_ALIASES[network] || network) as string

    // Get endpoints from Configuration.ts (reads from .env)
    const allEndpoints = Configuration.endpoints as Record<
        string,
        Endpoints | undefined
    >
    const endpoints = allEndpoints[resolvedNetwork]

    if (!endpoints) {
        const available = Object.keys(Configuration.endpoints).join(', ')
        const aliasInfo =
            network !== resolvedNetwork
                ? ` (resolved from alias '${network}')`
                : ''
        throw new Error(
            `Network '${resolvedNetwork}'${aliasInfo} not configured. Available networks: ${available}`
        )
    }

    // Construct config object
    const config = {
        name: resolvedNetwork,
        jsonRpcUrl: endpoints.jsonRpc,
        mirrorNodeUrl: endpoints.mirror || undefined,
        chainId: getChainId(resolvedNetwork),
    }

    // Runtime validation with Zod
    try {
        return NetworkConfigSchema.parse(config)
    } catch (err) {
        if (err instanceof z.ZodError) {
            const issues = err.issues
                .map((i) => `${i.path.join('.')}: ${i.message}`)
                .join(', ')
            const envPrefix = resolvedNetwork.toUpperCase().replace(/-/g, '_')
            throw new Error(
                `Invalid network configuration for '${resolvedNetwork}': ${issues}. ` +
                    `Check ${envPrefix}_JSON_RPC_ENDPOINT and ${envPrefix}_MIRROR_NODE_ENDPOINT environment variables.`
            )
        }
        throw err
    }
}

/**
 * Get all available network names.
 *
 * @returns Array of network identifiers from Configuration.ts
 *
 * @example
 * ```typescript
 * const networks = getAllNetworks()
 * console.log(networks) // ['testnet', 'mainnet', 'previewnet', 'local', 'hardhat']
 * ```
 */
export function getAllNetworks(): string[] {
    // Get network names from Configuration.ts
    return Object.keys(Configuration.endpoints)
}

/**
 * Check if a network exists in configuration.
 *
 * Resolves network aliases for backward compatibility.
 *
 * @param network - Network identifier to check
 * @returns true if network exists, false otherwise
 *
 * @example
 * ```typescript
 * if (hasNetwork('testnet')) { // Resolves to hedera-testnet
 *   const config = getNetworkConfig('testnet')
 * }
 * if (hasNetwork('hedera-testnet')) { // Direct name
 *   const config = getNetworkConfig('hedera-testnet')
 * }
 * ```
 */
export function hasNetwork(network: string): boolean {
    const resolvedNetwork = NETWORK_ALIASES[network] || network
    return resolvedNetwork in Configuration.endpoints
}

/**
 * Get private keys for a network.
 *
 * Reads from environment variables via Configuration.ts.
 * Expects: NETWORK_PRIVATE_KEY_0, NETWORK_PRIVATE_KEY_1, etc.
 *
 * Resolves network aliases for backward compatibility.
 *
 * @param network - Network identifier
 * @returns Array of private keys for the network
 *
 * @example
 * ```typescript
 * const keys = getPrivateKeys('testnet') // Resolves to hedera-testnet
 * console.log(`Found ${keys.length} private keys`)
 * ```
 */
export function getPrivateKeys(network: string): string[] {
    const resolvedNetwork = NETWORK_ALIASES[network] || network
    const allKeys = Configuration.privateKeys as Record<
        string,
        string[] | undefined
    >
    return allKeys[resolvedNetwork] || []
}

/**
 * Get deployed contract address for a network.
 *
 * Integrates with Configuration.ts to read deployed addresses from environment
 * variables (e.g., HEDERA_TESTNET_FACTORY, HEDERA_TESTNET_FACTORY_PROXY).
 *
 * Resolves network aliases for backward compatibility.
 *
 * @param contractName - Name of the contract
 * @param network - Network identifier
 * @param type - Type of address ('implementation', 'proxy', 'proxyAdmin')
 * @returns Contract address if deployed, undefined otherwise
 *
 * @example
 * ```typescript
 * const blrProxy = getDeployedAddress('BusinessLogicResolver', 'testnet', 'proxy')
 * const factoryImpl = getDeployedAddress('Factory', 'hedera-mainnet', 'implementation')
 * ```
 */
export function getDeployedAddress(
    contractName: string,
    network: string,
    type: 'implementation' | 'proxy' | 'proxyAdmin' = 'implementation'
): string | undefined {
    const resolvedNetwork = NETWORK_ALIASES[network] || network

    // Get contract config from Configuration.ts
    const allContracts = Configuration.contracts as Record<
        string,
        {
            addresses?: Record<
                string,
                {
                    address: string
                    proxyAddress?: string
                    proxyAdminAddress?: string
                }
            >
        }
    >

    const contractConfig = allContracts[contractName]
    if (!contractConfig?.addresses) {
        return undefined
    }

    const deployment = contractConfig.addresses[resolvedNetwork]
    if (!deployment) {
        return undefined
    }

    // Return appropriate address based on type
    switch (type) {
        case 'proxy':
            return deployment.proxyAddress
        case 'proxyAdmin':
            return deployment.proxyAdminAddress
        case 'implementation':
        default:
            return deployment.address
    }
}

/**
 * Check if a contract is deployed on a network.
 *
 * @param contractName - Name of the contract
 * @param network - Network identifier
 * @returns true if contract is deployed, false otherwise
 *
 * @example
 * ```typescript
 * if (isDeployed('Factory', 'testnet')) {
 *   console.log('Factory already deployed')
 * }
 * ```
 */
export function isDeployed(contractName: string, network: string): boolean {
    return getDeployedAddress(contractName, network) !== undefined
}
