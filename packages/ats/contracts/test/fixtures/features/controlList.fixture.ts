// SPDX-License-Identifier: Apache-2.0

/**
 * Control List feature test fixtures.
 *
 * Provides fixtures for testing control list functionality.
 */

import { deployEquityTokenFixture } from '../tokens/equity.fixture'
import { ATS_ROLES } from '../../../scripts'

/**
 * Fixture: Deploy equity token with control list configured
 *
 * Extends deployEquityTokenFixture with:
 * - CONTROL_LIST role granted to deployer
 * - PAUSER role granted to deployer (for pause testing)
 * - Token ready for control list operations
 *
 * @returns Infrastructure + token + control list setup
 */
export async function deployEquityWithControlListFixture() {
    const base = await deployEquityTokenFixture()
    const { deployer, accessControlFacet } = base

    // Grant control list management roles
    await accessControlFacet.grantRole(ATS_ROLES.CONTROL_LIST, deployer.address)
    await accessControlFacet.grantRole(ATS_ROLES.PAUSER, deployer.address)

    return {
        ...base,
    }
}
