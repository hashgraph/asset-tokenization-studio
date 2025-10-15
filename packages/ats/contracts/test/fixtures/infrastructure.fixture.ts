// SPDX-License-Identifier: Apache-2.0

/**
 * Core ATS infrastructure fixtures.
 *
 * Provides base deployment fixtures for:
 * - ProxyAdmin (upgrade management)
 * - BusinessLogicResolver (BLR) with facet registry
 * - Factory for token deployment
 * - All registered facets (equity and bond configurations)
 *
 * Uses Hardhat Network Helpers loadFixture pattern for efficient test setup.
 * Each fixture is executed once and snapshotted, subsequent calls restore state.
 *
 * @see https://hardhat.org/hardhat-network-helpers/docs/reference#loadfixture
 */

import { ethers } from 'hardhat'
import {
    HardhatProvider,
    deployCompleteSystem,
    configureLogger,
    LogLevel,
} from '../../scripts'
import type { IFactory, BusinessLogicResolver, ProxyAdmin } from '@typechain'

/**
 * Fixture: Deploy complete ATS infrastructure
 *
 * Deploys: ProxyAdmin, BLR, Factory, all Facets, Equity & Bond configurations
 *
 * @param useTimeTravel - Use TimeTravel facet variants (default: true for tests)
 * @returns Complete deployment output + test utilities including separated equity/bond facet addresses
 */
export async function deployAtsInfrastructureFixture(
    useTimeTravel = true,
    partialBatchDeploy = false,
    batchSize = 2
) {
    // Configure logger to SILENT for tests (suppress all deployment logs)
    configureLogger({ level: LogLevel.SILENT })

    const provider = new HardhatProvider()
    const signers = await ethers.getSigners()
    const [deployer, user1, user2, user3, user4, user5] = signers
    const unknownSigner = signers.at(-1)!

    // Deploy complete system using new scripts
    const deployment = await deployCompleteSystem(provider, 'hardhat', {
        useTimeTravel,
        saveOutput: false, // Don't save deployment files during tests
        partialBatchDeploy,
        batchSize,
    })

    // Get typed contract instances
    const factoryFactory = await provider.getFactory('Factory')
    const factory = factoryFactory.attach(
        deployment.infrastructure.factory.proxy
    ) as IFactory

    const blrFactory = await provider.getFactory('BusinessLogicResolver')
    const blr = blrFactory.attach(
        deployment.infrastructure.blr.proxy
    ) as BusinessLogicResolver

    const proxyAdminFactory = await provider.getFactory('ProxyAdmin')
    const proxyAdmin = proxyAdminFactory.attach(
        deployment.infrastructure.proxyAdmin.address
    ) as ProxyAdmin

    return {
        // Provider & signers
        provider,
        signers,
        deployer,
        user1,
        user2,
        user3,
        user4,
        user5,
        unknownSigner,

        // Core infrastructure
        factory,
        blr,
        proxyAdmin,

        // Deployment metadata
        deployment,

        // Facet keys (useful for verification)
        facetKeys: deployment.facets.reduce(
            (acc, f) => {
                acc[f.name] = f.key
                return acc
            },
            {} as Record<string, string>
        ),
        equityFacetKeys: deployment.helpers.getEquityFacets().reduce(
            (acc, f) => {
                acc[f.name] = f.key
                return acc
            },
            {} as Record<string, string>
        ),
        bondFacetKeys: deployment.helpers.getBondFacets().reduce(
            (acc, f) => {
                acc[f.name] = f.key
                return acc
            },
            {} as Record<string, string>
        ),
    }
}
