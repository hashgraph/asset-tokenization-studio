// SPDX-License-Identifier: Apache-2.0

/**
 * Deploy system components using an existing BLR.
 *
 * This workflow deploys facets, configurations, and Factory using an existing
 * BusinessLogicResolver that was deployed separately (e.g., in another system
 * or environment).
 *
 * Use cases:
 * - Deploying to a system where BLR is shared across multiple applications
 * - Testing facet updates against a stable BLR instance
 * - Deploying new configurations to existing infrastructure
 *
 * @module workflows/deployWithExistingBlr
 */

import {
    deployFacets,
    deployProxyAdmin,
    getAllFacets,
    validateAddress,
    fetchHederaContractId,
} from '@scripts/infrastructure'
import {
    deployFactory,
    createEquityConfiguration,
    createBondConfiguration,
} from '@scripts/domain'
import type { DeploymentProvider } from '@scripts/infrastructure'

import { promises as fs } from 'fs'
import { dirname } from 'path'
import { BusinessLogicResolver__factory } from '../../typechain-types'

/**
 * Deployment output structure (compatible with deployCompleteSystem).
 */
export interface DeploymentWithExistingBlrOutput {
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
            isExternal: true // Marker to indicate BLR was not deployed here
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
        skippedSteps: string[] // Steps that were skipped
    }
}

/**
 * Options for deploying with existing BLR.
 */
export interface DeployWithExistingBlrOptions {
    /** Whether to use TimeTravel variants for facets */
    useTimeTravel?: boolean

    /** Whether to save deployment output to file */
    saveOutput?: boolean

    /** Path to save deployment output (default: deployments/{network}-{timestamp}.json) */
    outputPath?: string

    /** Whether to deploy new facets (default: true) */
    deployFacets?: boolean

    /** Whether to deploy Factory (default: true) */
    deployFactory?: boolean

    /** Whether to create configurations (default: true) */
    createConfigurations?: boolean

    /** Existing ProxyAdmin address (optional, will deploy new one if not provided) */
    existingProxyAdminAddress?: string
}

/**
 * Deploy system components using an existing BLR.
 *
 * This workflow skips BLR deployment and uses the provided BLR address for:
 * 1. Deploying facets (optional)
 * 2. Creating Equity configuration (optional)
 * 3. Creating Bond configuration (optional)
 * 4. Deploying Factory (optional)
 *
 * @param provider - Deployment provider (HardhatProvider or StandaloneProvider)
 * @param network - Network name (testnet, mainnet, etc.)
 * @param blrAddress - Address of existing BusinessLogicResolver
 * @param options - Deployment options
 * @returns Promise resolving to deployment output
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
 * // Deploy facets and Factory against existing BLR
 * const output = await deployWithExistingBlr(
 *     provider,
 *     'hedera-testnet',
 *     '0x123...BLR...',
 *     {
 *         useTimeTravel: false,
 *         deployFacets: true,
 *         deployFactory: true,
 *         saveOutput: true
 *     }
 * )
 *
 * console.log(`Factory deployed: ${output.infrastructure.factory.proxy}`)
 * console.log(`Using BLR: ${output.infrastructure.blr.proxy}`)
 * ```
 */
export async function deployWithExistingBlr(
    provider: DeploymentProvider,
    network: string,
    blrAddress: string,
    options: DeployWithExistingBlrOptions = {}
): Promise<DeploymentWithExistingBlrOutput> {
    const {
        useTimeTravel = false,
        saveOutput = true,
        outputPath,
        deployFacets: shouldDeployFacets = true,
        deployFactory: shouldDeployFactory = true,
        createConfigurations: shouldCreateConfigurations = true,
        existingProxyAdminAddress,
    } = options

    // Validate BLR address
    validateAddress(blrAddress, 'BLR address')

    const startTime = Date.now()
    const signer = await provider.getSigner()
    const deployer = await signer.getAddress()

    console.log('🌟 ATS Deployment with Existing BLR')
    console.log('═'.repeat(60))
    console.log(`📡 Network: ${network}`)
    console.log(`👤 Deployer: ${deployer}`)
    console.log(`🔷 BLR Address: ${blrAddress}`)
    console.log(`🔄 TimeTravel: ${useTimeTravel ? 'Enabled' : 'Disabled'}`)
    console.log('═'.repeat(60))

    // Track total gas used
    let totalGasUsed = 0
    const skippedSteps: string[] = []

    try {
        // ========================================
        // STEP 1: Deploy or use existing ProxyAdmin
        // ========================================
        let proxyAdminAddress: string

        if (existingProxyAdminAddress) {
            console.log('\n📋 Step 1/5: Using existing ProxyAdmin...')
            validateAddress(existingProxyAdminAddress, 'ProxyAdmin address')
            proxyAdminAddress = existingProxyAdminAddress
            console.log(`✅ ProxyAdmin: ${proxyAdminAddress}`)
        } else {
            console.log('\n📋 Step 1/5: Deploying ProxyAdmin...')
            const proxyAdminResult = await deployProxyAdmin(provider)

            if (!proxyAdminResult.success) {
                throw new Error(
                    `ProxyAdmin deployment failed: ${proxyAdminResult.error}`
                )
            }

            totalGasUsed += parseInt(
                proxyAdminResult.deploymentResult.gasUsed?.toString() || '0'
            )
            proxyAdminAddress = proxyAdminResult.proxyAdminAddress
            console.log(`✅ ProxyAdmin: ${proxyAdminAddress}`)
        }

        // ========================================
        // STEP 2: BLR (SKIPPED - using existing)
        // ========================================
        console.log('\n🔷 Step 2/5: Using existing BLR...')
        console.log(`✅ BLR Proxy: ${blrAddress}`)
        skippedSteps.push('BLR deployment')

        // ========================================
        // STEP 3: Deploy facets (optional)
        // ========================================
        let facetsResult: Awaited<ReturnType<typeof deployFacets>> | undefined
        const facetAddresses: Record<string, string> = {}

        if (shouldDeployFacets) {
            console.log('\n📦 Step 3/5: Deploying all facets...')
            const allFacetNames = getAllFacets().map((f) => f.name)
            console.log(`   Found ${allFacetNames.length} facets in registry`)

            facetsResult = await deployFacets(provider, {
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

            // Build facetAddresses map
            facetsResult.deployed.forEach((deploymentResult, facetName) => {
                if (deploymentResult.address) {
                    facetAddresses[facetName] = deploymentResult.address
                }
            })

            console.log(
                `✅ Deployed ${facetsResult.deployed.size} facets successfully`
            )
        } else {
            console.log('\n📦 Step 3/5: Skipping facet deployment...')
            skippedSteps.push('Facet deployment')
        }

        // ========================================
        // STEP 4: Create configurations (optional)
        // ========================================
        let equityConfig:
            | Awaited<ReturnType<typeof createEquityConfiguration>>
            | undefined
        let bondConfig:
            | Awaited<ReturnType<typeof createBondConfiguration>>
            | undefined

        if (shouldCreateConfigurations) {
            if (Object.keys(facetAddresses).length === 0) {
                console.log(
                    '\n⚠️  Step 4/5: Skipping configurations (no facets deployed)...'
                )
                skippedSteps.push('Equity configuration', 'Bond configuration')
            } else {
                // Get BLR contract instance
                const signer = await provider.getSigner()
                const blrContract = BusinessLogicResolver__factory.connect(
                    blrAddress,
                    signer
                )

                // Create Equity Configuration
                console.log('\n💼 Step 4a/5: Creating Equity configuration...')

                equityConfig = await createEquityConfiguration(
                    blrContract,
                    facetAddresses,
                    useTimeTravel
                )

                if (!equityConfig.success) {
                    throw new Error(
                        `Equity config creation failed: ${equityConfig.error} - ${equityConfig.message}`
                    )
                }

                console.log(
                    `✅ Equity Config ID: ${equityConfig.data.configurationId}`
                )
                console.log(`✅ Equity Version: ${equityConfig.data.version}`)
                console.log(
                    `✅ Equity Facets: ${equityConfig.data.facetKeys.length}`
                )

                // Create Bond Configuration
                console.log('\n🏦 Step 4b/5: Creating Bond configuration...')

                bondConfig = await createBondConfiguration(
                    blrContract,
                    facetAddresses,
                    useTimeTravel
                )

                if (!bondConfig.success) {
                    throw new Error(
                        `Bond config creation failed: ${bondConfig.error} - ${bondConfig.message}`
                    )
                }

                console.log(
                    `✅ Bond Config ID: ${bondConfig.data.configurationId}`
                )
                console.log(`✅ Bond Version: ${bondConfig.data.version}`)
                console.log(
                    `✅ Bond Facets: ${bondConfig.data.facetKeys.length}`
                )
            }
        } else {
            console.log('\n💼 Step 4/5: Skipping configurations...')
            skippedSteps.push('Equity configuration', 'Bond configuration')
        }

        // ========================================
        // STEP 5: Deploy Factory (optional)
        // ========================================
        let factoryResult: Awaited<ReturnType<typeof deployFactory>> | undefined

        if (shouldDeployFactory) {
            console.log('\n🏭 Step 5/5: Deploying Factory...')
            factoryResult = await deployFactory(provider, {
                blrAddress,
                proxyAdminAddress,
            })

            if (!factoryResult.success) {
                throw new Error(
                    `Factory deployment failed: ${factoryResult.error}`
                )
            }

            console.log(
                `✅ Factory Implementation: ${factoryResult.implementationAddress}`
            )
            console.log(`✅ Factory Proxy: ${factoryResult.factoryAddress}`)
        } else {
            console.log('\n🏭 Step 5/5: Skipping Factory deployment...')
            skippedSteps.push('Factory deployment')
        }

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

        const output: DeploymentWithExistingBlrOutput = {
            network,
            timestamp: new Date().toISOString(),
            deployer,

            infrastructure: {
                proxyAdmin: {
                    address: proxyAdminAddress,
                    contractId: await getContractId(proxyAdminAddress),
                },
                blr: {
                    implementation: 'N/A (External BLR)',
                    proxy: blrAddress,
                    contractId: await getContractId(blrAddress),
                    isExternal: true,
                },
                factory: factoryResult
                    ? {
                          implementation: factoryResult.implementationAddress,
                          proxy: factoryResult.factoryAddress,
                          contractId: await getContractId(
                              factoryResult.factoryAddress
                          ),
                      }
                    : {
                          implementation: 'N/A (Not deployed)',
                          proxy: 'N/A (Not deployed)',
                      },
            },

            facets: facetsResult
                ? await Promise.all(
                      Array.from(facetsResult.deployed.entries()).map(
                          async ([facetName, deploymentResult]) => {
                              const facetAddress = deploymentResult.address!

                              // Find matching key from config
                              const equityFacet = equityConfig?.success
                                  ? equityConfig.data.facetKeys.find(
                                        (ef) => ef.address === facetAddress
                                    )
                                  : undefined
                              const bondFacet = bondConfig?.success
                                  ? bondConfig.data.facetKeys.find(
                                        (bf) => bf.address === facetAddress
                                    )
                                  : undefined

                              return {
                                  name: facetName,
                                  address: facetAddress,
                                  contractId: await getContractId(facetAddress),
                                  key: equityFacet?.key || bondFacet?.key || '',
                              }
                          }
                      )
                  )
                : [],

            configurations: {
                equity:
                    equityConfig && equityConfig.success
                        ? {
                              configId: equityConfig.data.configurationId,
                              version: equityConfig.data.version,
                              facetCount: equityConfig.data.facetKeys.length,
                              facets: equityConfig.data.facetKeys,
                          }
                        : {
                              configId: 'N/A (Not created)',
                              version: 0,
                              facetCount: 0,
                              facets: [],
                          },
                bond:
                    bondConfig && bondConfig.success
                        ? {
                              configId: bondConfig.data.configurationId,
                              version: bondConfig.data.version,
                              facetCount: bondConfig.data.facetKeys.length,
                              facets: bondConfig.data.facetKeys,
                          }
                        : {
                              configId: 'N/A (Not created)',
                              version: 0,
                              facetCount: 0,
                              facets: [],
                          },
            },

            summary: {
                totalContracts: 1 + (factoryResult ? 1 : 0), // ProxyAdmin + Factory (if deployed)
                totalFacets: facetsResult?.deployed.size || 0,
                totalConfigurations:
                    (equityConfig ? 1 : 0) + (bondConfig ? 1 : 0),
                deploymentTime: endTime - startTime,
                gasUsed: totalGasUsed.toString(),
                success: true,
                skippedSteps,
            },
        }

        // ========================================
        // Save output to file
        // ========================================
        if (saveOutput) {
            const finalOutputPath =
                outputPath ||
                `deployments/${network}-external-blr-${Date.now()}.json`

            await saveDeploymentOutput(output, finalOutputPath)
            console.log(`\n💾 Deployment output saved: ${finalOutputPath}`)
        }

        // ========================================
        // Print summary
        // ========================================
        console.log('\n' + '═'.repeat(60))
        console.log('✨ DEPLOYMENT COMPLETE')
        console.log('═'.repeat(60))
        console.log(
            `⏱️  Total time: ${(output.summary.deploymentTime / 1000).toFixed(2)}s`
        )
        console.log(`⛽ Total gas: ${output.summary.gasUsed}`)
        console.log(`📦 Facets deployed: ${output.summary.totalFacets}`)
        console.log(
            `⚙️  Configurations created: ${output.summary.totalConfigurations}`
        )
        if (skippedSteps.length > 0) {
            console.log(`⏭️  Skipped steps: ${skippedSteps.join(', ')}`)
        }
        console.log('═'.repeat(60))

        return output
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : String(error)

        console.error('\n❌ Deployment failed:', errorMessage)

        throw error
    }
}

/**
 * Save deployment output to JSON file.
 *
 * @param output - Deployment output
 * @param filePath - File path to save to
 */
async function saveDeploymentOutput(
    output: DeploymentWithExistingBlrOutput,
    filePath: string
): Promise<void> {
    try {
        // Ensure directory exists
        const dir = dirname(filePath)
        await fs.mkdir(dir, { recursive: true })

        // Write JSON file with pretty formatting
        await fs.writeFile(filePath, JSON.stringify(output, null, 2), 'utf-8')

        console.log(`💾 Deployment output saved to ${filePath}`)
    } catch (error) {
        console.warn(`Warning: Could not save deployment output: ${error}`)
    }
}
