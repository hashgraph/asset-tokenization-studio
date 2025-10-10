// SPDX-License-Identifier: Apache-2.0

/**
 * Verify deployment operation.
 *
 * Atomic operation for verifying that contracts are properly deployed,
 * configured, and operational.
 *
 * @module infrastructure/operations/verifyDeployment
 */

import {
    DeploymentProvider,
    validateAddress,
    table,
    info,
    debug,
    error as logError,
    success,
    warn,
    section,
    extractRevertReason,
    getProxyImplementation,
    getProxyAdmin,
    isFacetRegistered,
    getRegisteredFacetAddress,
    configurationExists,
    getConfigurationVersion,
} from '@scripts/infrastructure'

/**
 * Contract to verify.
 */
export interface ContractToVerify {
    /** Contract name/identifier */
    name: string

    /** Expected contract address */
    address: string

    /** Whether this is a proxy contract */
    isProxy?: boolean

    /** Expected implementation address (for proxies) */
    expectedImplementation?: string

    /** Expected ProxyAdmin address (for proxies) */
    expectedProxyAdmin?: string
}

/**
 * Facet to verify in BLR.
 */
export interface FacetToVerify {
    /** Facet name */
    name: string

    /** Expected facet address */
    expectedAddress: string
}

/**
 * Configuration to verify in BLR.
 */
export interface ConfigurationToVerify {
    /** Configuration ID */
    configurationId: string

    /** Expected minimum version */
    minVersion?: number
}

/**
 * Options for verifying a deployment.
 */
export interface VerifyDeploymentOptions {
    /** Contracts to verify */
    contracts?: ContractToVerify[]

    /** BLR address (if verifying facets/configurations) */
    blrAddress?: string

    /** Facets to verify in BLR */
    facets?: FacetToVerify[]

    /** Configurations to verify in BLR */
    configurations?: ConfigurationToVerify[]

    /** Whether to fail fast on first error */
    failFast?: boolean
}

/**
 * Verification result for a single item.
 */
export interface VerificationItem {
    /** Item name/identifier */
    name: string

    /** Whether verification passed */
    passed: boolean

    /** Details about the verification */
    details: string

    /** Error message if verification failed */
    error?: string
}

/**
 * Result of deployment verification.
 */
export interface VerifyDeploymentResult {
    /** Whether all verifications passed */
    success: boolean

    /** Total items verified */
    totalItems: number

    /** Number of items that passed */
    passedItems: number

    /** Number of items that failed */
    failedItems: number

    /** Detailed results for each item */
    items: VerificationItem[]

    /** Summary of failures */
    failures: string[]
}

/**
 * Verify deployment of contracts, facets, and configurations.
 *
 * This operation performs comprehensive verification to ensure that
 * all components are deployed correctly and configured as expected.
 *
 * @param provider - Deployment provider
 * @param options - Verification options
 * @returns Verification result
 *
 * @example
 * ```typescript
 * const result = await verifyDeployment(provider, {
 *   contracts: [
 *     { name: 'Factory', address: '0x123...', isProxy: true },
 *     { name: 'ProxyAdmin', address: '0x456...' }
 *   ],
 *   blrAddress: '0x789...',
 *   facets: [
 *     { name: 'AccessControlFacet', expectedAddress: '0xabc...' }
 *   ],
 *   configurations: [
 *     { configurationId: EQUITY_CONFIG_ID, minVersion: 1 }
 *   ]
 * })
 *
 * if (result.success) {
 *   console.log('All verifications passed!')
 * } else {
 *   console.error(`${result.failedItems} items failed verification`)
 * }
 * ```
 */
export async function verifyDeployment(
    provider: DeploymentProvider,
    options: VerifyDeploymentOptions
): Promise<VerifyDeploymentResult> {
    const {
        contracts = [],
        blrAddress,
        facets = [],
        configurations = [],
        failFast = false,
    } = options

    const items: VerificationItem[] = []
    const failures: string[] = []

    section('Verifying Deployment')

    try {
        // Verify contracts
        if (contracts.length > 0) {
            info(`Verifying ${contracts.length} contracts...`)

            for (const contract of contracts) {
                if (failFast && failures.length > 0) break

                const result = await verifyContract(provider, contract)
                items.push(result)

                if (!result.passed) {
                    failures.push(`${contract.name}: ${result.error}`)
                }
            }
        }

        // Verify facets in BLR
        if (facets.length > 0 && blrAddress) {
            info(`Verifying ${facets.length} facets in BLR...`)

            for (const facet of facets) {
                if (failFast && failures.length > 0) break

                const result = await verifyFacet(provider, blrAddress, facet)
                items.push(result)

                if (!result.passed) {
                    failures.push(`Facet ${facet.name}: ${result.error}`)
                }
            }
        } else if (facets.length > 0 && !blrAddress) {
            warn(
                'Facets specified but no BLR address provided, skipping facet verification'
            )
        }

        // Verify configurations in BLR
        if (configurations.length > 0 && blrAddress) {
            info(`Verifying ${configurations.length} configurations in BLR...`)

            for (const config of configurations) {
                if (failFast && failures.length > 0) break

                const result = await verifyConfiguration(
                    provider,
                    blrAddress,
                    config
                )
                items.push(result)

                if (!result.passed) {
                    failures.push(
                        `Configuration ${config.configurationId}: ${result.error}`
                    )
                }
            }
        } else if (configurations.length > 0 && !blrAddress) {
            warn(
                'Configurations specified but no BLR address provided, skipping configuration verification'
            )
        }

        // Calculate results
        const passedItems = items.filter((i) => i.passed).length
        const failedItems = items.filter((i) => !i.passed).length
        const allPassed = failedItems === 0 && items.length > 0

        // Display results table
        if (items.length > 0) {
            const tableRows = items.map((item) => [
                item.passed ? '✓' : '✗',
                item.name,
                item.details,
            ])

            table(['Status', 'Item', 'Details'], tableRows)
        }

        // Display summary
        if (allPassed) {
            success(`All ${passedItems} verifications passed!`)
        } else if (failedItems > 0) {
            logError(`${failedItems} of ${items.length} verifications failed:`)
            failures.forEach((f) => logError(`  - ${f}`))
        } else {
            warn('No items to verify')
        }

        return {
            success: allPassed,
            totalItems: items.length,
            passedItems,
            failedItems,
            items,
            failures,
        }
    } catch (err) {
        const errorMessage = extractRevertReason(err)
        logError(`Verification failed: ${errorMessage}`)

        return {
            success: false,
            totalItems: items.length,
            passedItems: items.filter((i) => i.passed).length,
            failedItems: items.filter((i) => !i.passed).length + 1,
            items,
            failures: [...failures, errorMessage],
        }
    }
}

/**
 * Verify a single contract.
 */
async function verifyContract(
    provider: DeploymentProvider,
    contract: ContractToVerify
): Promise<VerificationItem> {
    try {
        debug(`Verifying contract: ${contract.name}`)

        // Validate address format
        validateAddress(contract.address, contract.name)

        // Check contract has code
        const ethProvider = provider.getProvider()
        const code = await ethProvider.getCode(contract.address)

        if (code === '0x') {
            return {
                name: contract.name,
                passed: false,
                details: `No code at ${contract.address}`,
                error: 'Contract not deployed',
            }
        }

        // If it's a proxy, verify implementation and admin
        if (contract.isProxy) {
            const implementation = await getProxyImplementation(
                provider,
                contract.address
            )

            if (
                contract.expectedImplementation &&
                implementation.toLowerCase() !==
                    contract.expectedImplementation.toLowerCase()
            ) {
                return {
                    name: contract.name,
                    passed: false,
                    details: `Implementation mismatch: ${implementation}`,
                    error: `Expected ${contract.expectedImplementation}`,
                }
            }

            const proxyAdmin = await getProxyAdmin(provider, contract.address)

            if (
                contract.expectedProxyAdmin &&
                proxyAdmin.toLowerCase() !==
                    contract.expectedProxyAdmin.toLowerCase()
            ) {
                return {
                    name: contract.name,
                    passed: false,
                    details: `ProxyAdmin mismatch: ${proxyAdmin}`,
                    error: `Expected ${contract.expectedProxyAdmin}`,
                }
            }

            return {
                name: contract.name,
                passed: true,
                details: `Proxy at ${contract.address}`,
            }
        }

        return {
            name: contract.name,
            passed: true,
            details: `Contract at ${contract.address}`,
        }
    } catch (err) {
        const errorMessage = extractRevertReason(err)
        return {
            name: contract.name,
            passed: false,
            details: 'Verification failed',
            error: errorMessage,
        }
    }
}

/**
 * Verify a facet is registered in BLR.
 */
async function verifyFacet(
    provider: DeploymentProvider,
    blrAddress: string,
    facet: FacetToVerify
): Promise<VerificationItem> {
    try {
        debug(`Verifying facet: ${facet.name}`)

        const isRegistered = await isFacetRegistered(
            provider,
            blrAddress,
            facet.name
        )

        if (!isRegistered) {
            return {
                name: `Facet: ${facet.name}`,
                passed: false,
                details: 'Not registered in BLR',
                error: 'Facet not found',
            }
        }

        const registeredAddress = await getRegisteredFacetAddress(
            provider,
            blrAddress,
            facet.name
        )

        if (
            !registeredAddress ||
            registeredAddress.toLowerCase() !==
                facet.expectedAddress.toLowerCase()
        ) {
            return {
                name: `Facet: ${facet.name}`,
                passed: false,
                details: `Address mismatch: ${registeredAddress}`,
                error: `Expected ${facet.expectedAddress}`,
            }
        }

        return {
            name: `Facet: ${facet.name}`,
            passed: true,
            details: `Registered at ${registeredAddress}`,
        }
    } catch (err) {
        const errorMessage = extractRevertReason(err)
        return {
            name: `Facet: ${facet.name}`,
            passed: false,
            details: 'Verification failed',
            error: errorMessage,
        }
    }
}

/**
 * Verify a configuration exists in BLR.
 */
async function verifyConfiguration(
    provider: DeploymentProvider,
    blrAddress: string,
    config: ConfigurationToVerify
): Promise<VerificationItem> {
    try {
        debug(`Verifying configuration: ${config.configurationId}`)

        const exists = await configurationExists(
            provider,
            blrAddress,
            config.configurationId
        )

        if (!exists) {
            return {
                name: `Config: ${config.configurationId}`,
                passed: false,
                details: 'Configuration not found',
                error: 'Not created in BLR',
            }
        }

        const version = await getConfigurationVersion(
            provider,
            blrAddress,
            config.configurationId
        )

        if (config.minVersion && version < config.minVersion) {
            return {
                name: `Config: ${config.configurationId}`,
                passed: false,
                details: `Version ${version} is too low`,
                error: `Expected minimum version ${config.minVersion}`,
            }
        }

        return {
            name: `Config: ${config.configurationId}`,
            passed: true,
            details: `Version ${version}`,
        }
    } catch (err) {
        const errorMessage = extractRevertReason(err)
        return {
            name: `Config: ${config.configurationId}`,
            passed: false,
            details: 'Verification failed',
            error: errorMessage,
        }
    }
}

/**
 * Quick verification of essential contracts.
 *
 * Convenience function for verifying that critical contracts are deployed
 * and have code.
 *
 * @param provider - Deployment provider
 * @param contracts - Map of contract names to addresses
 * @returns true if all contracts verified
 *
 * @example
 * ```typescript
 * const verified = await quickVerify(provider, {
 *   'Factory': '0x123...',
 *   'ProxyAdmin': '0x456...',
 *   'BLR': '0x789...'
 * })
 * ```
 */
export async function quickVerify(
    provider: DeploymentProvider,
    contracts: Record<string, string>
): Promise<boolean> {
    const contractsToVerify: ContractToVerify[] = Object.entries(contracts).map(
        ([name, address]) => ({
            name,
            address,
        })
    )

    const result = await verifyDeployment(provider, {
        contracts: contractsToVerify,
    })

    return result.success
}
