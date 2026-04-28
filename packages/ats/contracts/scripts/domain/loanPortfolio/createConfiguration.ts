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
import { LOANS_PORTFOLIO_CONFIG_ID } from "../constants";
import { atsRegistry } from "../atsRegistry";
import { BusinessLogicResolver } from "@contract-types";

/**
 * Loan Portfolio Facets
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
 * Note: Loan Portfolio does NOT include TimeTravel variants (per spec). TimeTravelFacet
 * is injected automatically by the deploy script in test environments.
 */
const LOANS_PORTFOLIO_FACETS = [
  "LoansPortfolioFacet",
  // Core Functionality
  "AccessControlFacet",
  "AllowanceFacet",
  "CapFacet",
  "ControlListFacet",
  "CorporateActionsFacet",
  "DiamondFacet",
  "CoreFacet",
  "TransferFacet",
  "CoreAdjustedFacet",
  "FreezeFacet",
  "KycFacet",
  "PauseFacet",
  "BalanceTrackerFacet",
  "BalanceTrackerAdjustedFacet",
  "SnapshotsFacet",
  "SsiManagementFacet",
  "BalanceTrackerByPartitionFacet",

  // ERC Standards
  "ERC1410IssuerFacet",
  "ERC1410ManagementFacet",
  "ERC1410ReadFacet",
  "ERC1410TokenHolderFacet",
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

  // Nominal Value
  "NominalValueFacet",

  // Hold
  "HoldFacet",
  "HoldManagementFacet",
  "ControllerHoldByPartitionFacet",
  "HoldByPartitionFacet",

  // Clearing & Settlement
  "ClearingTransferFacet",
  "ClearingRedeemFacet",
  "ClearingHoldCreationFacet",
  "OperatorClearingHoldByPartitionFacet",
  "ClearingReadFacet",
  "ClearingActionsFacet",

  // Scheduled Tasks
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

export async function createLoansPortfolioConfiguration(
  blrContract: BusinessLogicResolver,
  facetAddresses: Record<string, string>,
  useTimeTravel: boolean = false,
  partialBatchDeploy: boolean = false,
  batchSize: number = DEFAULT_BATCH_SIZE,
  confirmations: number = 0,
): Promise<OperationResult<ConfigurationData, ConfigurationError>> {
  const facetNames = useTimeTravel
    ? [...LOANS_PORTFOLIO_FACETS.map((name) => `${name}TimeTravel`), "TimeTravelFacet"]
    : [...LOANS_PORTFOLIO_FACETS];

  // Build facet data with resolver keys from registry
  const facets = facetNames.map((name) => {
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
    configurationId: LOANS_PORTFOLIO_CONFIG_ID,
    facets,
    partialBatchDeploy,
    batchSize,
    confirmations,
  });
}
