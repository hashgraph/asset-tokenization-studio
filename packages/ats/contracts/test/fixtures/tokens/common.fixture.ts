// SPDX-License-Identifier: Apache-2.0

/**
 * Common token utilities and shared fixture helpers.
 *
 * Provides utility functions and types used across multiple token fixtures.
 */

import { ATS_ROLES, AtsRoleHash, AtsRoleName } from '@scripts'
import { AccessControlFacet } from '@typechain'
import { ethers } from 'hardhat'

/**
 * Common constants for token testing
 */
export const MAX_UINT256 = ethers.constants.MaxUint256

/**
 * Test partition identifiers
 */
export const TEST_PARTITIONS = {
    DEFAULT: ethers.utils.formatBytes32String('default'),
    PARTITION_1: ethers.utils.formatBytes32String('partition1'),
    PARTITION_2: ethers.utils.formatBytes32String('partition2'),
    PARTITION_3: ethers.utils.formatBytes32String('partition3'),
} as const

/**
 * Common test amounts
 */
export const TEST_AMOUNTS = {
    SMALL: ethers.utils.parseUnits('100', 6),
    MEDIUM: ethers.utils.parseUnits('1000', 6),
    LARGE: ethers.utils.parseUnits('10000', 6),
} as const

export async function executeRbac(
    accessControlFacet: AccessControlFacet,
    rbac: {
        role: AtsRoleName | AtsRoleHash
        members: string[]
    }[]
) {
    await Promise.all(
        rbac.map(async (r) => {
            const roleHash =
                ATS_ROLES[r.role as AtsRoleName] || (r.role as AtsRoleHash)
            await Promise.all(
                r.members.map(async (m) => {
                    return accessControlFacet.grantRole(roleHash, m)
                })
            )
        })
    )
}
