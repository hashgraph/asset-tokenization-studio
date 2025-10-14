// SPDX-License-Identifier: Apache-2.0

/**
 * Bond token configuration module.
 *
 * Creates bond token configuration in BusinessLogicResolver by calling
 * the generic infrastructure operation with bond-specific facet list and config ID.
 *
 * This is a thin wrapper around the generic createConfiguration() operation,
 * providing bond-specific facet list and configuration ID.
 *
 * @module domain/bond/createConfiguration
 */

import { Contract } from 'ethers'
import {
    createConfiguration,
    ConfigurationData,
    ConfigurationError,
    OperationResult,
} from '@scripts/infrastructure'
import { BOND_CONFIG_ID } from '@scripts/domain'

/**
 * Bond-specific facets list (43 facets total).
 *
 * This is an explicit positive list of all facets required for bond tokens.
 * Includes all common facets plus BondUSAFacet (NOT EquityUSAFacet).
 *
 * Updated to match origin/develop feature parity (all facets registered).
 */
const BOND_FACETS = [
    // Core Functionality
    'AccessControlFacet',
    'CapFacet',
    'ControlListFacet',
    'CorporateActionsFacet',
    'DiamondCutFacet',
    'DiamondFacet',
    'DiamondLoupeFacet',
    'ERC20Facet',
    'FreezeFacet',
    'KycFacet',
    'PauseFacet',
    'SnapshotsFacet',

    // ERC Standards
    'ERC1410IssuerFacet',
    'ERC1410ManagementFacet',
    'ERC1410ReadFacet',
    'ERC1410TokenHolderFacet',
    'ERC1594Facet',
    'ERC1643Facet',
    'ERC1644Facet',
    'ERC20PermitFacet',
    'ERC20VotesFacet',
    'ERC3643BatchFacet',
    'ERC3643ManagementFacet',
    'ERC3643OperationsFacet',
    'ERC3643ReadFacet',

    // Clearing & Settlement
    'ClearingActionsFacet',
    'ClearingHoldCreationFacet',
    'ClearingReadFacet',
    'ClearingRedeemFacet',
    'ClearingTransferFacet',
    'HoldManagementFacet',
    'HoldReadFacet',
    'HoldTokenHolderFacet',

    // External Management
    'ExternalControlListManagementFacet',
    'ExternalKycListManagementFacet',
    'ExternalPauseManagementFacet',

    // Advanced Features
    'AdjustBalancesFacet',
    'LockFacet',
    'ProceedRecipientsFacet',
    'ProtectedPartitionsFacet',
    'ScheduledBalanceAdjustmentsFacet',
    'ScheduledCrossOrderedTasksFacet',
    'ScheduledSnapshotsFacet',
    'SsiManagementFacet',
    'TransferAndLockFacet',

    // Jurisdiction-Specific
    'BondUSAFacet',
    'BondUSAReadFacet',
] as const

/**
 * Create bond token configuration in BusinessLogicResolver.
 *
 * Thin wrapper that calls the generic core operation with bond-specific data:
 * - Configuration ID: BOND_CONFIG_ID
 * - Facet list: BOND_FACETS (43 facets)
 *
 * All implementation logic is handled by the generic createConfiguration()
 * operation in core/operations/blrConfigurations.ts.
 *
 * @param blrContract - BusinessLogicResolver contract instance
 * @param facetAddresses - Map of facet names to their deployed addresses
 * @param useTimeTravel - Whether to use TimeTravel variants (default: false)
 * @returns Promise resolving to operation result
 *
 * @example
 * ```typescript
 * import { BusinessLogicResolver__factory } from '@typechain'
 *
 * // Get BLR contract instance
 * const blr = BusinessLogicResolver__factory.connect('0x1234...', signer)
 *
 * // Create bond configuration
 * const result = await createBondConfiguration(
 *     blr,
 *     {
 *         'AccessControlFacet': '0xabc...',
 *         'BondUSAFacet': '0xdef...',
 *         // ... more facets
 *     },
 *     false
 * )
 *
 * if (result.success) {
 *   console.log(`Bond config version: ${result.data.version}`)
 *   console.log(`Registered ${result.data.facetKeys.length} facets`)
 * } else {
 *   console.error(`Failed: ${result.error} - ${result.message}`)
 * }
 * ```
 */
export async function createBondConfiguration(
    blrContract: Contract,
    facetAddresses: Record<string, string>,
    useTimeTravel: boolean = false
): Promise<OperationResult<ConfigurationData, ConfigurationError>> {
    return createConfiguration(blrContract, {
        configurationId: BOND_CONFIG_ID,
        facetNames: BOND_FACETS,
        facetAddresses,
        useTimeTravel,
    })
}
