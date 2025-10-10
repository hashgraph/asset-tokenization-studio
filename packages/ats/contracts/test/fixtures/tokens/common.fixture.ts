// SPDX-License-Identifier: Apache-2.0

/**
 * Common token utilities and shared fixture helpers.
 *
 * Provides utility functions and types used across multiple token fixtures.
 */

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
