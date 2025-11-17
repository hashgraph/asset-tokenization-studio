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

import { Contract } from "ethers";
import {
  ConfigurationData,
  ConfigurationError,
  createBatchConfiguration,
  OperationResult,
  DEFAULT_BATCH_SIZE,
} from "@scripts/infrastructure";
import { BOND_CONFIG_ID, atsRegistry } from "@scripts/domain";

/**
 * Bond-specific facets list (41 facets total).
 *
 * This is an explicit positive list of all facets required for bond tokens.
 * Includes all common facets plus BondUSAFacet (NOT EquityUSAFacet).
 *
 * Note: DiamondFacet combines DiamondCutFacet + DiamondLoupeFacet functionality,
 * so we only include DiamondFacet to avoid selector collisions.
 *
 * Updated to match origin/develop feature parity (all facets registered).
 */
const BOND_FACETS = [
  // Core Functionality (10 - DiamondFacet combines DiamondCutFacet + DiamondLoupeFacet)
  "AccessControlFacet",
  "CapFacet",
  "ControlListFacet",
  "CorporateActionsFacet",
  "DiamondFacet", // Combined: includes DiamondCutFacet + DiamondLoupeFacet functionality
  "ERC20Facet",
  "FreezeFacet",
  "KycFacet",
  "PauseFacet",
  "SnapshotsFacet",

  // ERC Standards
  "ERC1410IssuerFacet",
  "ERC1410ManagementFacet",
  "ERC1410ReadFacet",
  "ERC1410TokenHolderFacet",
  "ERC1594Facet",
  "ERC1643Facet",
  "ERC1644Facet",
  "ERC20PermitFacet",
  "ERC20VotesFacet",
  "ERC3643BatchFacet",
  "ERC3643ManagementFacet",
  "ERC3643OperationsFacet",
  "ERC3643ReadFacet",

  // Clearing & Settlement
  "ClearingActionsFacet",
  "ClearingHoldCreationFacet",
  "ClearingReadFacet",
  "ClearingRedeemFacet",
  "ClearingTransferFacet",
  "HoldManagementFacet",
  "HoldReadFacet",
  "HoldTokenHolderFacet",

  // External Management
  "ExternalControlListManagementFacet",
  "ExternalKycListManagementFacet",
  "ExternalPauseManagementFacet",

  // Advanced Features
  "AdjustBalancesFacet",
  "LockFacet",
  "ProceedRecipientsFacet",
  "ProtectedPartitionsFacet",
  "ScheduledBalanceAdjustmentsFacet",
  "ScheduledCrossOrderedTasksFacet",
  "ScheduledSnapshotsFacet",
  "SsiManagementFacet",
  "TransferAndLockFacet",

  // Jurisdiction-Specific
  "BondUSAFacet",
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
export async function createBondConfiguration(
  blrContract: Contract,
  facetAddresses: Record<string, string>,
  useTimeTravel: boolean = false,
  partialBatchDeploy: boolean = false,
  batchSize: number = DEFAULT_BATCH_SIZE,
  confirmations: number = 0,
): Promise<OperationResult<ConfigurationData, ConfigurationError>> {
  // Get facet names based on time travel mode
  // Include TimeTravelFacet when useTimeTravel=true to provide time manipulation functions
  const baseFacets = useTimeTravel ? [...BOND_FACETS, "TimeTravelFacet"] : BOND_FACETS;

  const facetNames = useTimeTravel
    ? baseFacets.map((name) => (name === "TimeTravelFacet" || name.endsWith("TimeTravel") ? name : `${name}TimeTravel`))
    : baseFacets;

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
    configurationId: BOND_CONFIG_ID,
    facets,
    partialBatchDeploy,
    batchSize,
    confirmations,
  });
}
