#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0

/**
 * Hardhat CLI entry point for ATS deployment.
 *
 * This script provides a command-line interface for deploying the complete
 * ATS system from within a Hardhat project. It uses HardhatProvider and reads
 * configuration from the Hardhat runtime environment.
 *
 * Usage (from within Hardhat project):
 *   npx ts-node scripts/cli/hardhat.ts
 *   or
 *   npm run deploy
 *
 * @module cli/hardhat
 */

import { deployCompleteSystem } from '../workflows/deployCompleteSystem'
import {
    HardhatProvider,
    getNetworkConfig,
    getAllNetworks,
} from '@scripts/infrastructure'

/**
 * Main deployment function for Hardhat environment.
 */
async function main() {
    // Get network from Hardhat config
    const hre = await import('hardhat')
    const networkName = hre.network.name

    console.log(`🚀 Starting ATS deployment on network: ${networkName}`)
    console.log('='.repeat(60))

    // Validate network configuration
    const availableNetworks = getAllNetworks()
    if (!availableNetworks.includes(networkName)) {
        console.error(
            `❌ Network '${networkName}' not configured in Configuration.ts`
        )
        console.log(`Available networks: ${availableNetworks.join(', ')}`)
        process.exit(1)
    }

    // Get network config
    const networkConfig = getNetworkConfig(networkName)
    console.log(`📡 RPC URL: ${networkConfig.jsonRpcUrl}`)

    // Create Hardhat provider
    const provider = new HardhatProvider()

    // Check for TimeTravel mode from environment
    const useTimeTravel = process.env.USE_TIME_TRAVEL === 'true'

    try {
        // Deploy complete system
        const output = await deployCompleteSystem(provider, networkName, {
            useTimeTravel,
            saveOutput: true,
        })

        console.log('\n' + '='.repeat(60))
        console.log('✅ Deployment completed successfully!')
        console.log('='.repeat(60))
        console.log('\n📋 Deployment Summary:')
        console.log(
            `   ProxyAdmin: ${output.infrastructure.proxyAdmin.address}`
        )
        console.log(`   BLR Proxy: ${output.infrastructure.blr.proxy}`)
        console.log(`   Factory Proxy: ${output.infrastructure.factory.proxy}`)
        console.log(`   Total Facets: ${output.facets.length}`)
        console.log(
            `   Equity Config Version: ${output.configurations.equity.version}`
        )
        console.log(
            `   Bond Config Version: ${output.configurations.bond.version}`
        )
        console.log(`   Total Contracts: ${output.summary.totalContracts}`)
        console.log(`   Deployment Time: ${output.summary.deploymentTime}ms`)

        process.exit(0)
    } catch (error) {
        console.error('\n❌ Deployment failed:')
        console.error(error)
        process.exit(1)
    }
}

// Run if called directly
if (require.main === module) {
    main().catch((error) => {
        console.error(error)
        process.exit(1)
    })
}

export { main }
