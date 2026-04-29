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
 * @module domain/bondFixedRate/createConfiguration
 */

import {
  ConfigurationData,
  ConfigurationError,
  createBatchConfiguration,
  OperationResult,
  DEFAULT_BATCH_SIZE,
} from "@scripts/infrastructure";
import { BOND_FIXED_RATE_CONFIG_ID, atsRegistry } from "@scripts/domain";
import { BusinessLogicResolver } from "@contract-types";

/**
 * Bond Fixed Rate facets list.
 *
 * Uses base facets plus FixedRate-specific facets.
 * Base facets are shared across all bond configurations.
 * FixedRate-specific facets handle interest rate calculations.
 *
 */
const BOND_FIXED_RATE_FACETS = [
  // Core Functionality
  "AccessControlFacet",
  "CapFacet",
  "ControlListFacet",
  "CorporateActionsFacet",
  "DiamondFacet",
  "FreezeFacet",
  "BatchFreezeFacet",
  "KycFacet",
  "PauseFacet",
  "BalanceTrackerFacet",
  "BalanceTrackerAdjustedFacet",
  "SnapshotsFacet",
  "BalanceTrackerByPartitionFacet",
  "BalanceTrackerAtSnapshotFacet",
  "BalanceTrackerAtSnapshotByPartitionFacet",

  // Core
  "CoreFacet",

  // Allowance
  "AllowanceFacet",

  // CoreAdjusted
  "CoreAdjustedFacet",

  // ERC Standards
  "TransferFacet",
  "MintByPartitionFacet",
  "ERC1410ManagementFacet",
  "ERC1410ReadFacet",
  "ERC1410TokenHolderFacet",
  "BurnByPartitionFacet",
  "DocumentationFacet",
  "ControllerFacet",
  "ERC20PermitFacet",
  "NoncesFacet",
  "ERC20VotesFacet",
  "BatchControllerFacet",
  "BatchBurnFacet",
  "BatchMintFacet",
  "BatchTransferFacet",
  "ERC3643ManagementFacet",
  "ERC3643ReadFacet",
  "ComplianceFacet",
  "MintFacet",
  "BurnFacet",

  // Clearing & Settlement
  "ClearingActionsFacet",
  "ClearingHoldCreationFacet",
  "OperatorClearingHoldByPartitionFacet",
  "ClearingReadFacet",
  "ClearingRedeemFacet",
  "ClearingTransferFacet",
  "HoldFacet",
  "HoldManagementFacet",
  "ControllerHoldByPartitionFacet",
  "ProtectedHoldByPartitionFacet",
  "HoldByPartitionFacet",

  // External Management
  "ExternalControlListManagementFacet",
  "ExternalKycListManagementFacet",
  "ExternalPauseManagementFacet",

  // Advanced Features
  "AdjustBalancesFacet",
  "LockFacet",
  "NominalValueFacet",
  "ProceedRecipientsFacet",
  "ProtectedPartitionsFacet",
  "ScheduledBalanceAdjustmentsFacet",
  "ScheduledCrossOrderedTasksFacet",
  "ScheduledCouponListingFacet",
  "SsiManagementFacet",

  // Interest Rate (rate-specific)
  "CouponFixedRateFacet",
  "FixedRateFacet",

  // Jurisdiction-Specific
  "BondUSAFixedRateFacet",
  "BondUSAReadFacet",
] as const;

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
 * @param partialBatchDeploy - Whether this is a partial batch deployment (default: false)
 * @param batchSize - Number of facets per batch (default: DEFAULT_BATCH_SIZE)
 * @param confirmations - Number of confirmations to wait for (default: 0 for test environments)
 * @returns Promise resolving to operation result
 *
 * @example
 * ```typescript
 * import { BusinessLogicResolver__factory } from '@contract-types'
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
 *     false,
 *     false,
 *     15,
 *     0
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
export async function createBondFixedRateConfiguration(
  blrContract: BusinessLogicResolver,
  facetAddresses: Record<string, string>,
  useTimeTravel: boolean = false,
  partialBatchDeploy: boolean = false,
  batchSize: number = DEFAULT_BATCH_SIZE,
  confirmations: number = 0,
): Promise<OperationResult<ConfigurationData, ConfigurationError>> {
  // Build facet list based on time travel mode
  // When useTimeTravel=true, ALL facets get TimeTravel suffix (universal mapping)
  // plus TimeTravelFacet controller. No filtering needed — simplifies deployment logic.
  const facetNames = useTimeTravel
    ? [...BOND_FIXED_RATE_FACETS.map((name) => `${name}TimeTravel`), "TimeTravelFacet"]
    : [...BOND_FIXED_RATE_FACETS];

  // Build facet data with resolver keys from registry
  const facets = facetNames.map((name) => {
    // Strip "TimeTravel" suffix to get base name for registry lookup
    const baseName = name.replace(/TimeTravel$/, "");

    const facetDef = atsRegistry.getFacetDefinition(baseName);
    if (!facetDef?.resolverKey?.value) {
      throw new Error(`No resolver key found for facet: ${baseName}`);
    }
    return {
      facetName: name,
      resolverKey: facetDef.resolverKey.value,
      address: facetAddresses[name],
    };
  });

  return createBatchConfiguration(blrContract, {
    configurationId: BOND_FIXED_RATE_CONFIG_ID,
    facets,
    partialBatchDeploy,
    batchSize,
    confirmations,
  });
}
