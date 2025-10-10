// SPDX-License-Identifier: Apache-2.0

/**
 * Complete ATS system deployment workflow.
 *
 * Orchestrates the deployment of the entire Asset Tokenization Studio infrastructure:
 * - ProxyAdmin for upgrade management
 * - BusinessLogicResolver (BLR) with proxy
 * - All facets (46 total, with optional TimeTravel variants)
 * - Facet registration in BLR
 * - Equity and Bond configurations
 * - Factory contract with proxy
 *
 * Provides comprehensive deployment output including all addresses, keys, config IDs,
 * versions, and optional Hedera Contract IDs.
 *
 * @module workflows/deployCompleteSystem
 */

import {
    deployProxyAdmin,
    deployBlr,
    deployFacets,
    getAllFacets,
    registerFacets,
    success,
    info,
    warn,
    error as logError,
} from '@scripts/infrastructure'
import {
    deployFactory,
    createEquityConfiguration,
    createBondConfiguration,
} from '@scripts/domain'
import type { DeploymentProvider } from '@scripts/infrastructure'

import { promises as fs } from 'fs'
import { dirname } from 'path'
import { BusinessLogicResolver__factory } from '@typechain'

/**
 * Complete deployment output structure.
 */
export interface DeploymentOutput {
    /** Network name (testnet, mainnet, etc.) */
    network: string

    /** ISO timestamp of deployment */
    timestamp: string

    /** Deployer address */
    deployer: string

    /** Infrastructure contracts */
    infrastructure: {
        proxyAdmin: {
            address: string
            contractId?: string
        }
        blr: {
            implementation: string
            proxy: string
            contractId?: string
        }
        factory: {
            implementation: string
            proxy: string
            contractId?: string
        }
    }

    /** Deployed facets */
    facets: Array<{
        name: string
        address: string
        contractId?: string
        key: string
    }>

    /** Token configurations */
    configurations: {
        equity: {
            configId: string
            version: number
            facetCount: number
            facets: Array<{
                facetName: string
                key: string
                address: string
            }>
        }
        bond: {
            configId: string
            version: number
            facetCount: number
            facets: Array<{
                facetName: string
                key: string
                address: string
            }>
        }
    }

    /** Deployment summary */
    summary: {
        totalContracts: number
        totalFacets: number
        totalConfigurations: number
        deploymentTime: number
        gasUsed: string
        success: boolean
    }
}

/**
 * Options for complete system deployment.
 */
export interface DeployCompleteSystemOptions {
    /** Whether to use TimeTravel variants for facets */
    useTimeTravel?: boolean

    /** Whether to save deployment output to file */
    saveOutput?: boolean

    /** Path to save deployment output (default: deployments/{network}-{timestamp}.json) */
    outputPath?: string
}

/**
 * Deploy complete ATS system.
 *
 * Executes the full deployment workflow:
 * 1. Deploy ProxyAdmin
 * 2. Deploy BusinessLogicResolver with proxy
 * 3. Deploy all facets (46 total)
 * 4. Register facets in BLR
 * 5. Create Equity configuration
 * 6. Create Bond configuration
 * 7. Deploy Factory with proxy
 *
 * Returns comprehensive deployment output with all addresses, keys, versions, and IDs.
 *
 * @param provider - Deployment provider (HardhatProvider or StandaloneProvider)
 * @param network - Network name (testnet, mainnet, etc.)
 * @param options - Deployment options
 * @returns Promise resolving to complete deployment output
 *
 * @example
 * ```typescript
 * import { StandaloneProvider } from './infrastructure/providers'
 *
 * // Create provider
 * const provider = new StandaloneProvider({
 *     rpcUrl: 'https://testnet.hashio.io/api',
 *     privateKey: process.env.PRIVATE_KEY!
 * })
 *
 * // Deploy complete system to testnet
 * const output = await deployCompleteSystem(provider, 'hedera-testnet', {
 *     useTimeTravel: false,
 *     saveOutput: true
 * })
 *
 * info(`BLR Proxy: ${output.infrastructure.blr.proxy}`)
 * info(`Factory Proxy: ${output.infrastructure.factory.proxy}`)
 * info(`Equity Config Version: ${output.configurations.equity.version}`)
 * info(`Bond Config Version: ${output.configurations.bond.version}`)
 * ```
 */
export async function deployCompleteSystem(
    provider: DeploymentProvider,
    network: string,
    options: DeployCompleteSystemOptions = {}
): Promise<DeploymentOutput> {
    const { useTimeTravel = false, saveOutput = true, outputPath } = options

    const startTime = Date.now()
    const signer = await provider.getSigner()
    const deployer = await signer.getAddress()

    info('🌟 ATS Complete System Deployment')
    info('═'.repeat(60))
    info(`📡 Network: ${network}`)
    info(`👤 Deployer: ${deployer}`)
    info(`🔄 TimeTravel: ${useTimeTravel ? 'Enabled' : 'Disabled'}`)
    info('═'.repeat(60))

    // Track total gas used
    let totalGasUsed = 0

    try {
        // ========================================
        // STEP 1: Deploy ProxyAdmin
        // ========================================
        info('\n📋 Step 1/7: Deploying ProxyAdmin...')
        const proxyAdminResult = await deployProxyAdmin(provider)

        if (!proxyAdminResult.success) {
            throw new Error(
                `ProxyAdmin deployment failed: ${proxyAdminResult.error}`
            )
        }

        totalGasUsed += parseInt(
            proxyAdminResult.deploymentResult.gasUsed?.toString() || '0'
        )
        info(`✅ ProxyAdmin: ${proxyAdminResult.proxyAdminAddress}`)

        // ========================================
        // STEP 2: Deploy BusinessLogicResolver
        // ========================================
        info('\n🔷 Step 2/7: Deploying BusinessLogicResolver...')
        const blrResult = await deployBlr(provider, {
            proxyAdminAddress: proxyAdminResult.proxyAdminAddress,
        })

        if (!blrResult.success) {
            throw new Error(`BLR deployment failed: ${blrResult.error}`)
        }

        // BLR gas is tracked in proxyResult receipts
        info(`✅ BLR Implementation: ${blrResult.implementationAddress}`)
        info(`✅ BLR Proxy: ${blrResult.blrAddress}`)

        // ========================================
        // STEP 3: Deploy all facets
        // ========================================
        info('\n📦 Step 3/7: Deploying all facets...')
        const allFacetNames = getAllFacets().map((f) => f.name)
        info(`   Found ${allFacetNames.length} facets in registry`)

        const facetsResult = await deployFacets(provider, {
            facetNames: allFacetNames,
            useTimeTravel,
        })

        if (!facetsResult.success) {
            throw new Error('Facet deployment had failures')
        }

        // Facets are returned in a Map<string, DeploymentResult>
        facetsResult.deployed.forEach((deploymentResult) => {
            totalGasUsed += parseInt(
                deploymentResult.gasUsed?.toString() || '0'
            )
        })

        info(`✅ Deployed ${facetsResult.deployed.size} facets successfully`)

        // ========================================
        // STEP 4: Register facets in BLR
        // ========================================
        info('\n📝 Step 4/7: Registering facets in BLR...')

        const facetAddresses: Record<string, string> = {}
        facetsResult.deployed.forEach((deploymentResult, facetName) => {
            if (deploymentResult.address) {
                facetAddresses[facetName] = deploymentResult.address
            }
        })

        const registerResult = await registerFacets(provider, {
            blrAddress: blrResult.blrAddress,
            facets: facetAddresses,
        })

        if (!registerResult.success) {
            throw new Error(
                `Facet registration failed: ${registerResult.error}`
            )
        }

        totalGasUsed += registerResult.gasUsed || 0
        info(`✅ Registered ${registerResult.registered.length} facets in BLR`)

        if (registerResult.failed.length > 0) {
            warn(
                `⚠️  ${registerResult.failed.length} facets failed registration`
            )
        }

        // ========================================
        // STEP 5: Create Equity Configuration
        // ========================================
        info('\n💼 Step 5/7: Creating Equity configuration...')

        // Get BLR contract instance
        const signer = await provider.getSigner()
        const blrContract = BusinessLogicResolver__factory.connect(
            blrResult.blrAddress,
            signer
        )

        const equityConfig = await createEquityConfiguration(
            blrContract,
            facetAddresses,
            useTimeTravel
        )

        if (!equityConfig.success) {
            throw new Error(
                `Equity config creation failed: ${equityConfig.error} - ${equityConfig.message}`
            )
        }

        info(`✅ Equity Config ID: ${equityConfig.data.configurationId}`)
        info(`✅ Equity Version: ${equityConfig.data.version}`)
        info(`✅ Equity Facets: ${equityConfig.data.facetKeys.length}`)

        // ========================================
        // STEP 6: Create Bond Configuration
        // ========================================
        info('\n🏦 Step 6/7: Creating Bond configuration...')

        const bondConfig = await createBondConfiguration(
            blrContract,
            facetAddresses,
            useTimeTravel
        )

        if (!bondConfig.success) {
            throw new Error(
                `Bond config creation failed: ${bondConfig.error} - ${bondConfig.message}`
            )
        }

        info(`✅ Bond Config ID: ${bondConfig.data.configurationId}`)
        info(`✅ Bond Version: ${bondConfig.data.version}`)
        info(`✅ Bond Facets: ${bondConfig.data.facetKeys.length}`)

        // ========================================
        // STEP 7: Deploy Factory
        // ========================================
        info('\n🏭 Step 7/7: Deploying Factory...')
        const factoryResult = await deployFactory(provider, {
            blrAddress: blrResult.blrAddress,
            proxyAdminAddress: proxyAdminResult.proxyAdminAddress,
        })

        if (!factoryResult.success) {
            throw new Error(`Factory deployment failed: ${factoryResult.error}`)
        }

        // Factory gas is tracked in proxyResult receipts
        info(
            `✅ Factory Implementation: ${factoryResult.implementationAddress}`
        )
        info(`✅ Factory Proxy: ${factoryResult.factoryAddress}`)

        // ========================================
        // Build comprehensive output
        // ========================================
        const endTime = Date.now()

        // Get Hedera Contract IDs if on Hedera network
        const getContractId = async (address: string) => {
            return network.toLowerCase().includes('hedera')
                ? await fetchHederaContractId(network, address)
                : undefined
        }

        const output: DeploymentOutput = {
            network,
            timestamp: new Date().toISOString(),
            deployer,

            infrastructure: {
                proxyAdmin: {
                    address: proxyAdminResult.proxyAdminAddress,
                    contractId: await getContractId(
                        proxyAdminResult.proxyAdminAddress
                    ),
                },
                blr: {
                    implementation: blrResult.implementationAddress,
                    proxy: blrResult.blrAddress,
                    contractId: await getContractId(blrResult.blrAddress),
                },
                factory: {
                    implementation: factoryResult.implementationAddress,
                    proxy: factoryResult.factoryAddress,
                    contractId: await getContractId(
                        factoryResult.factoryAddress
                    ),
                },
            },

            facets: await Promise.all(
                Array.from(facetsResult.deployed.entries()).map(
                    async ([facetName, deploymentResult]) => {
                        const facetAddress = deploymentResult.address!

                        // Find matching key from config
                        const equityFacet = equityConfig.data.facetKeys.find(
                            (ef) => ef.address === facetAddress
                        )
                        const bondFacet = bondConfig.data.facetKeys.find(
                            (bf) => bf.address === facetAddress
                        )

                        return {
                            name: facetName,
                            address: facetAddress,
                            contractId: await getContractId(facetAddress),
                            key: equityFacet?.key || bondFacet?.key || '',
                        }
                    }
                )
            ),

            configurations: {
                equity: {
                    configId: equityConfig.data.configurationId,
                    version: equityConfig.data.version,
                    facetCount: equityConfig.data.facetKeys.length,
                    facets: equityConfig.data.facetKeys,
                },
                bond: {
                    configId: bondConfig.data.configurationId,
                    version: bondConfig.data.version,
                    facetCount: bondConfig.data.facetKeys.length,
                    facets: bondConfig.data.facetKeys,
                },
            },

            summary: {
                totalContracts: 3, // ProxyAdmin, BLR, Factory
                totalFacets: facetsResult.deployed.size,
                totalConfigurations: 2, // Equity + Bond
                deploymentTime: endTime - startTime,
                gasUsed: totalGasUsed.toString(),
                success: true,
            },
        }

        // ========================================
        // Save output to file
        // ========================================
        if (saveOutput) {
            // Generate human-readable timestamp: network_yyyy-mm-dd_hh-mm-ss.json
            const now = new Date()
            const year = now.getFullYear()
            const month = String(now.getMonth() + 1).padStart(2, '0')
            const day = String(now.getDate()).padStart(2, '0')
            const hours = String(now.getHours()).padStart(2, '0')
            const minutes = String(now.getMinutes()).padStart(2, '0')
            const seconds = String(now.getSeconds()).padStart(2, '0')
            const timestamp = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`

            const finalOutputPath =
                outputPath || `deployments/${network}_${timestamp}.json`

            await saveDeploymentOutput(output, finalOutputPath)
            info(`\n💾 Deployment output saved: ${finalOutputPath}`)
        }

        // ========================================
        // Print summary
        // ========================================
        info('\n' + '═'.repeat(60))
        info('✨ DEPLOYMENT COMPLETE')
        info('═'.repeat(60))
        info(
            `⏱️  Total time: ${(output.summary.deploymentTime / 1000).toFixed(2)}s`
        )
        info(`⛽ Total gas: ${output.summary.gasUsed}`)
        info(`📦 Facets deployed: ${output.summary.totalFacets}`)
        info(
            `⚙️  Configurations created: ${output.summary.totalConfigurations}`
        )
        info('═'.repeat(60))

        return output
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : String(error)

        logError('\n❌ Deployment failed:', errorMessage)

        throw error
    }
}

/**
 * Fetch Hedera Contract ID from mirror node.
 *
 * @param network - Network name
 * @param evmAddress - EVM address (0x...)
 * @returns Hedera Contract ID (0.0.xxxxx) or undefined
 */
async function fetchHederaContractId(
    network: string,
    evmAddress: string
): Promise<string | undefined> {
    try {
        const mirrorNodeUrl = getMirrorNodeUrl(network)
        const response = await fetch(
            `${mirrorNodeUrl}/api/v1/contracts/${evmAddress}`
        )

        if (!response.ok) {
            return undefined
        }

        const data = await response.json()
        return data.contract_id
    } catch {
        return undefined
    }
}

/**
 * Get mirror node URL for network.
 *
 * Uses getNetworkConfig to read from Configuration.ts/.env with fallback to defaults.
 *
 * @param network - Network name
 * @returns Mirror node base URL
 */
function getMirrorNodeUrl(network: string): string {
    try {
        // Import here to avoid circular dependency during config loading
        const { getNetworkConfig } = require('../core/config')
        const config = getNetworkConfig(network)

        if (config.mirrorNodeUrl) {
            return config.mirrorNodeUrl
        }
    } catch (error) {
        // Fall through to defaults if config not available
        const msg = error instanceof Error ? error.message : String(error)
        warn(`Could not read mirror node URL from config: ${msg}`)
    }

    // Fallback to hardcoded defaults
    const lowerNetwork = network.toLowerCase()
    if (lowerNetwork.includes('mainnet')) {
        return 'https://mainnet-public.mirrornode.hedera.com'
    }
    if (lowerNetwork.includes('testnet')) {
        return 'https://testnet.mirrornode.hedera.com'
    }
    if (lowerNetwork.includes('previewnet')) {
        return 'https://previewnet.mirrornode.hedera.com'
    }

    // Default to testnet
    return 'https://testnet.mirrornode.hedera.com'
}

/**
 * Save deployment output to JSON file.
 *
 * @param output - Deployment output
 * @param filePath - File path to save to
 */
async function saveDeploymentOutput(
    output: DeploymentOutput,
    filePath: string
): Promise<void> {
    try {
        // Ensure directory exists
        const dir = dirname(filePath)
        await fs.mkdir(dir, { recursive: true })

        // Write JSON file with pretty formatting
        await fs.writeFile(filePath, JSON.stringify(output, null, 2), 'utf-8')

        success('Deployment output saved', { path: filePath })
    } catch (error) {
        warn(`Warning: Could not save deployment output: ${error}`)
    }
}
