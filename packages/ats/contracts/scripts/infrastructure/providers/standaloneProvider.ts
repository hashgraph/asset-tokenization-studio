// SPDX-License-Identifier: Apache-2.0

/**
 * Standalone deployment provider for framework-independent contract deployment.
 *
 * This provider enables running deployment scripts without Hardhat framework,
 * using plain ethers.js with direct artifact loading from filesystem.
 *
 * Benefits:
 * - Faster startup (no Hardhat initialization overhead)
 * - Simpler CI/CD integration
 * - Direct control over provider and signer
 * - Works with any JSON-RPC endpoint
 *
 * @module core/standaloneProvider
 */

import {
    Contract,
    ContractFactory,
    Signer,
    Overrides,
    providers,
    Wallet,
} from 'ethers'
import { promises as fs } from 'fs'
import { join, resolve } from 'path'
import { ARTIFACTS_PATHS, DeploymentProvider } from '@scripts/infrastructure'

/**
 * Configuration for StandaloneProvider.
 */
export interface StandaloneProviderConfig {
    /**
     * JSON-RPC endpoint URL.
     * @example 'http://127.0.0.1:8545'
     * @example 'https://testnet.hashio.io/api'
     */
    rpcUrl: string

    /**
     * Private key for signing transactions (with or without 0x prefix).
     * @example '0x1234567890abcdef...'
     */
    privateKey: string

    /**
     * Path to artifacts directory.
     * Defaults to './artifacts' (Hardhat standard).
     * Use './out' for Foundry artifacts.
     */
    artifactsPath?: string

    /**
     * Chain ID for the network.
     * @example 31337 for Hardhat, 296 for Hedera testnet
     */
    chainId?: number
}

/**
 * Hardhat artifact structure.
 */
interface HardhatArtifact {
    contractName: string
    abi: any[]
    bytecode: string
    deployedBytecode: string
    linkReferences: any
    deployedLinkReferences: any
}

/**
 * Standalone provider implementation using ethers.js directly.
 *
 * Supports both Hardhat and Foundry artifacts, with configurable RPC endpoint
 * and private key for signing.
 *
 * @example
 * ```typescript
 * const provider = new StandaloneProvider({
 *     rpcUrl: 'http://127.0.0.1:8545',
 *     privateKey: process.env.PRIVATE_KEY!,
 *     artifactsPath: './artifacts',
 * })
 *
 * const factory = await provider.getFactory('AccessControlFacet')
 * const contract = await provider.deploy(factory)
 * ```
 */
export class StandaloneProvider implements DeploymentProvider {
    private provider: providers.JsonRpcProvider
    private signer: Signer
    private artifactsPath: string
    private artifactCache: Map<string, HardhatArtifact> = new Map()

    /**
     * Create a new StandaloneProvider.
     *
     * @param config - Provider configuration
     * @throws Error if private key or RPC URL is invalid
     */
    constructor(config: StandaloneProviderConfig) {
        // Validate configuration
        if (!config.rpcUrl) {
            throw new Error('rpcUrl is required')
        }
        if (!config.privateKey) {
            throw new Error('privateKey is required')
        }

        // Normalize private key (add 0x prefix if missing)
        const privateKey = config.privateKey.startsWith('0x')
            ? config.privateKey
            : `0x${config.privateKey}`

        // Create provider and signer
        this.provider = new providers.JsonRpcProvider(
            config.rpcUrl,
            config.chainId
        )
        this.signer = new Wallet(privateKey, this.provider)

        // Set artifacts path
        this.artifactsPath = resolve(
            config.artifactsPath || ARTIFACTS_PATHS.hardhat
        )
    }

    /**
     * Get a signer for transactions.
     *
     * @returns Promise resolving to a Signer instance
     */
    async getSigner(): Promise<Signer> {
        return this.signer
    }

    /**
     * Get a contract factory by name.
     *
     * Loads artifacts from filesystem and creates factory.
     * Supports both Hardhat and Foundry artifact formats.
     *
     * @param contractName - Name of contract (e.g., 'AccessControlFacet')
     * @returns Promise resolving to ContractFactory instance
     * @throws Error if artifact not found or invalid
     */
    async getFactory(contractName: string): Promise<ContractFactory> {
        try {
            // Check cache first
            let artifact = this.artifactCache.get(contractName)

            if (!artifact) {
                // Load artifact from filesystem
                artifact = await this.loadArtifact(contractName)
                this.artifactCache.set(contractName, artifact)
            }

            // Validate artifact
            if (!artifact.abi || !artifact.bytecode) {
                throw new Error(
                    `Invalid artifact for ${contractName}: missing abi or bytecode`
                )
            }

            // Create and return factory
            return new ContractFactory(
                artifact.abi,
                artifact.bytecode,
                this.signer
            )
        } catch (error) {
            throw new Error(
                `Failed to get factory for contract '${contractName}': ${
                    error instanceof Error ? error.message : String(error)
                }`
            )
        }
    }

    /**
     * Deploy a contract.
     *
     * @param factory - Contract factory
     * @param args - Constructor arguments (optional)
     * @param overrides - Transaction overrides (gas, gasPrice, etc.)
     * @returns Promise resolving to deployed Contract instance
     * @throws Error if deployment fails
     */
    async deploy(
        factory: ContractFactory,
        args: any[] = [],
        overrides?: Overrides
    ): Promise<Contract> {
        try {
            const contract = await factory.deploy(...args, overrides || {})
            await contract.deployed()
            return contract
        } catch (error) {
            throw new Error(
                `Failed to deploy contract: ${
                    error instanceof Error ? error.message : String(error)
                }`
            )
        }
    }

    /**
     * Deploy a TransparentUpgradeableProxy.
     *
     * Loads the proxy contract artifact and deploys it.
     *
     * @param implementationAddress - Address of implementation contract
     * @param proxyAdminAddress - Address of ProxyAdmin
     * @param initData - Initialization data (encoded function call), defaults to '0x'
     * @param overrides - Transaction overrides
     * @returns Promise resolving to deployed proxy Contract
     * @throws Error if proxy deployment fails
     */
    async deployProxy(
        implementationAddress: string,
        proxyAdminAddress: string,
        initData: string = '0x',
        overrides?: Overrides
    ): Promise<Contract> {
        try {
            const proxyFactory = await this.getFactory(
                'TransparentUpgradeableProxy'
            )

            const proxy = await proxyFactory.deploy(
                implementationAddress,
                proxyAdminAddress,
                initData,
                overrides || {}
            )
            await proxy.deployed()

            return proxy
        } catch (error) {
            throw new Error(
                `Failed to deploy proxy: ${
                    error instanceof Error ? error.message : String(error)
                }`
            )
        }
    }

    /**
     * Upgrade a proxy implementation.
     *
     * @param proxyAddress - Address of the proxy to upgrade
     * @param newImplementationAddress - Address of new implementation
     * @param proxyAdminAddress - Address of ProxyAdmin
     * @param overrides - Transaction overrides
     * @returns Promise resolving when upgrade is complete
     * @throws Error if upgrade fails
     */
    async upgradeProxy(
        proxyAddress: string,
        newImplementationAddress: string,
        proxyAdminAddress: string,
        overrides?: Overrides
    ): Promise<void> {
        try {
            const proxyAdminFactory = await this.getFactory('ProxyAdmin')
            const proxyAdmin = proxyAdminFactory.attach(proxyAdminAddress)

            const tx = await proxyAdmin.upgrade(
                proxyAddress,
                newImplementationAddress,
                overrides || {}
            )
            await tx.wait()
        } catch (error) {
            throw new Error(
                `Failed to upgrade proxy: ${
                    error instanceof Error ? error.message : String(error)
                }`
            )
        }
    }

    /**
     * Get provider for read operations.
     *
     * @returns Provider instance for reading blockchain state
     */
    getProvider(): providers.Provider {
        return this.provider
    }

    /**
     * Load artifact from filesystem.
     *
     * Searches in standard Hardhat artifact locations:
     * - artifacts/contracts/{ContractName}.sol/{ContractName}.json
     * - artifacts/@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol/TransparentUpgradeableProxy.json
     *
     * @param contractName - Name of the contract
     * @returns Promise resolving to artifact
     * @throws Error if artifact not found
     */
    private async loadArtifact(contractName: string): Promise<HardhatArtifact> {
        // Standard Hardhat paths to try
        const paths = [
            // Most contracts: artifacts/contracts/{Name}.sol/{Name}.json
            join(
                this.artifactsPath,
                'contracts',
                `${contractName}.sol`,
                `${contractName}.json`
            ),
            // OpenZeppelin proxy
            join(
                this.artifactsPath,
                '@openzeppelin',
                'contracts',
                'proxy',
                'transparent',
                'TransparentUpgradeableProxy.sol',
                'TransparentUpgradeableProxy.json'
            ),
            // OpenZeppelin ProxyAdmin
            join(
                this.artifactsPath,
                '@openzeppelin',
                'contracts',
                'proxy',
                'transparent',
                'ProxyAdmin.sol',
                'ProxyAdmin.json'
            ),
        ]

        // Try each path
        for (const path of paths) {
            try {
                const content = await fs.readFile(path, 'utf-8')
                const artifact = JSON.parse(content) as HardhatArtifact
                return artifact
            } catch (error) {
                // Continue to next path
            }
        }

        // Not found in any standard location
        throw new Error(
            `Artifact not found for ${contractName}. Searched paths:\n${paths.join('\n')}`
        )
    }
}

/**
 * Create a standalone provider from environment variables.
 *
 * Reads configuration from standard environment variables:
 * - NETWORK or HARDHAT_NETWORK: Network name
 * - {NETWORK}_JSON_RPC_ENDPOINT: JSON-RPC URL
 * - {NETWORK}_PRIVATE_KEY_0: Private key for signing
 * - ARTIFACTS_PATH (optional): Path to artifacts directory
 *
 * @returns StandaloneProvider instance
 * @throws Error if required environment variables are missing
 *
 * @example
 * ```typescript
 * // Set environment variables
 * process.env.NETWORK = 'hedera-testnet'
 * process.env.HEDERA_TESTNET_JSON_RPC_ENDPOINT = 'https://testnet.hashio.io/api'
 * process.env.HEDERA_TESTNET_PRIVATE_KEY_0 = '0x...'
 *
 * // Create provider
 * const provider = createStandaloneProviderFromEnv()
 * ```
 */
export function createStandaloneProviderFromEnv(): StandaloneProvider {
    // Get network name
    const network =
        process.env.NETWORK || process.env.HARDHAT_NETWORK || 'hardhat'

    // Convert network name to uppercase and replace hyphens for env var lookup
    const networkPrefix = network.toUpperCase().replace(/-/g, '_')

    // Get RPC URL
    const rpcUrl =
        process.env[`${networkPrefix}_JSON_RPC_ENDPOINT`] ||
        (network === 'hardhat' ? 'http://127.0.0.1:8545' : '')

    if (!rpcUrl) {
        throw new Error(
            `Missing RPC URL for network '${network}'. Set ${networkPrefix}_JSON_RPC_ENDPOINT environment variable.`
        )
    }

    // Get private key
    const privateKey = process.env[`${networkPrefix}_PRIVATE_KEY_0`]

    if (!privateKey) {
        throw new Error(
            `Missing private key for network '${network}'. Set ${networkPrefix}_PRIVATE_KEY_0 environment variable.`
        )
    }

    // Get optional artifacts path
    const artifactsPath = process.env.ARTIFACTS_PATH

    // Create and return provider
    return new StandaloneProvider({
        rpcUrl,
        privateKey,
        artifactsPath,
    })
}
