// SPDX-License-Identifier: Apache-2.0

/**
 * Loan Portfolio token configuration module.
 *
 * Creates loan portfolio token configuration in BusinessLogicResolver by calling
 * the generic infrastructure operation with loan portfolio-specific facet list and config ID.
 *
 * This is a thin wrapper around the generic createConfiguration() operation,
 * providing loan portfolio-specific facet list and configuration ID.
 *
 * @module domain/loanPortfolio/createConfiguration
 */

import {
  ConfigurationData,
  ConfigurationError,
  createBatchConfiguration,
  OperationResult,
  DEFAULT_BATCH_SIZE,
} from "@scripts/infrastructure";
import { LOAN_PORTFOLIO_CONFIG_ID } from "../constants";
import { atsRegistry } from "../atsRegistry";
import { BusinessLogicResolver } from "@contract-types";

/**
 * Loan Portfolio-specific facets list (48 facets total).
 *
 * This is an explicit positive list of all facets required for loan portfolio tokens.
 * Includes all infrastructure facets EXCEPT:
 * - BondUSAReadFacet
 * - ProceedRecipientsFacet
 * - EquityUSAFacet
 * - CouponFacet
 *
 * Note: DiamondFacet combines DiamondCutFacet + DiamondLoupeFacet functionality,
 * so we only include DiamondFacet to avoid selector collisions.
 *
 * Note: Loan Portfolio does NOT include TimeTravel variants (per spec).
 */
const LOAN_PORTFOLIO_FACETS = [
  // Core Functionality
  "AccessControlFacet",
  "CapFacet",
  "ControlListFacet",
  "CorporateActionsFacet",
  "DiamondFacet",
  "ERC20Facet",
  "FreezeFacet",
  "KycFacet",
  "PauseFacet",
  "SnapshotsFacet",
  "SsiManagementFacet",
  "TotalBalanceFacet",

  // ERC Standards
  "ERC1410IssuerFacet",
  "ERC1410ManagementFacet",
  "ERC1410ReadFacet",
  "ERC1410TokenHolderFacet",
  "ERC1594Facet",
  "ERC1643Facet",
  "ERC1644Facet",
  "ERC20PermitFacet",
  "NoncesFacet",
  "ERC20VotesFacet",
  "ERC3643BatchFacet",
  "ERC3643ManagementFacet",
  "ERC3643OperationsFacet",
  "ERC3643ReadFacet",

  // Nominal Value
  "NominalValueFacet",

  // Hold
  "HoldReadFacet",
  "HoldManagementFacet",
  "HoldTokenHolderFacet",

  // Clearing & Settlement
  "ClearingTransferFacet",
  "ClearingRedeemFacet",
  "ClearingHoldCreationFacet",
  "ClearingReadFacet",
  "ClearingActionsFacet",

  // Scheduled Tasks
  "ScheduledSnapshotsFacet",
  "ScheduledBalanceAdjustmentsFacet",
  "ScheduledCrossOrderedTasksFacet",
  "ScheduledCouponListingFacet",

  // External Management
  "ExternalPauseManagementFacet",
  "ExternalControlListManagementFacet",
  "ExternalKycListManagementFacet",

  // Advanced Features
  "AdjustBalancesFacet",
  "LockFacet",
  "ProtectedPartitionsFacet",
  "TransferAndLockFacet",
] as const;

/**
 * Create loan portfolio token configuration in BusinessLogicResolver.
 *
 * Thin wrapper that calls the generic core operation with loan portfolio-specific data:
 * - Configuration ID: LOAN_PORTFOLIO_CONFIG_ID
 * - Facet list: LOAN_PORTFOLIO_FACETS (48 facets)
 *
 * All implementation logic is handled by the generic createConfiguration()
 * operation in core/operations/blrConfigurations.ts.
 *
 * Note: Loan Portfolio configuration does NOT include TimeTravel variants.
 *
 * @param blrContract - BusinessLogicResolver contract instance
 * @param facetAddresses - Map of facet names to their deployed addresses
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
 * // Create loan portfolio configuration
 * const result = await createLoanPortfolioConfiguration(
 *     blr,
 *     {
 *         'AccessControlFacet': '0xabc...',
 *         'NominalValueFacet': '0xdef...',
 *         // ... more facets
 *     },
 *     false,
 *     15,
 *     0
 * )
 *
 * if (result.success) {
 *   console.log(`Loan Portfolio config version: ${result.data.version}`)
 *   console.log(`Registered ${result.data.facetKeys.length} facets`)
 * } else {
 *   console.error(`Failed: ${result.error} - ${result.message}`)
 * }
 * ```
 */
export async function createLoanPortfolioConfiguration(
  blrContract: BusinessLogicResolver,
  facetAddresses: Record<string, string>,
  partialBatchDeploy: boolean = false,
  batchSize: number = DEFAULT_BATCH_SIZE,
  confirmations: number = 0,
): Promise<OperationResult<ConfigurationData, ConfigurationError>> {
  // Build facet data with resolver keys from registry
  const facets = LOAN_PORTFOLIO_FACETS.map((name) => {
    const facetDef = atsRegistry.getFacetDefinition(name);
    if (!facetDef?.resolverKey?.value) {
      throw new Error(`No resolver key found for facet: ${name}`);
    }
    return {
      facetName: name,
      resolverKey: facetDef.resolverKey.value,
      address: facetAddresses[name],
    };
  });

  return createBatchConfiguration(blrContract, {
    configurationId: LOAN_PORTFOLIO_CONFIG_ID,
    facets,
    partialBatchDeploy,
    batchSize,
    confirmations,
  });
}
