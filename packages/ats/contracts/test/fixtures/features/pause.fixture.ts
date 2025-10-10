// SPDX-License-Identifier: Apache-2.0

/**
 * Pause feature test fixtures.
 *
 * Provides fixtures for testing pause functionality with external pause contracts.
 */

import { deployEquityTokenFixture } from '../tokens/equity.fixture'
import {
    MockedExternalPause__factory,
    ExternalPauseManagement__factory,
} from '@typechain'
import { ATS_ROLES, GAS_LIMIT } from '../../../scripts'

/**
 * Fixture: Deploy equity token with external pause mock
 *
 * Extends deployEquityTokenFixture with:
 * - MockedExternalPause contract deployed and configured
 * - ExternalPauseManagement facet connected
 * - PAUSER and PAUSE_MANAGER roles granted to deployer
 *
 * @returns Infrastructure + token + external pause setup
 */
export async function deployEquityWithExternalPauseFixture() {
    const base = await deployEquityTokenFixture()
    const { deployer, diamond, accessControlFacet } = base

    // Deploy mock external pause contract
    const externalPauseMock = await new MockedExternalPause__factory(
        deployer
    ).deploy({ gasLimit: GAS_LIMIT.high })
    await externalPauseMock.deployed()

    // Get external pause management facet
    const externalPauseManagement = ExternalPauseManagement__factory.connect(
        diamond.address,
        deployer
    )

    // Add external pause to the token
    await accessControlFacet.grantRole(ATS_ROLES.PAUSER, deployer.address)
    await accessControlFacet.grantRole(
        ATS_ROLES.PAUSE_MANAGER,
        deployer.address
    )
    await externalPauseManagement.addExternalPause(externalPauseMock.address, {
        gasLimit: GAS_LIMIT.high,
    })

    return {
        ...base,
        externalPauseMock,
        externalPauseManagement,
    }
}
