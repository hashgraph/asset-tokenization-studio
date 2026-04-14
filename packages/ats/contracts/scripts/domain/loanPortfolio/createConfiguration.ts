// SPDX-License-Identifier: Apache-2.0

/**
 * Loans Portfolio token configuration module.
 *
 * Creates loans portfolio token configuration in BusinessLogicResolver by calling
 * the generic infrastructure operation with loans-portfolio-specific facet list and config ID.
 *
 * @module domain/loanPortfolio/createConfiguration
 */

import {
  ConfigurationData,
  ConfigurationError,
  OperationResult,
  createBatchConfiguration,
  DEFAULT_BATCH_SIZE,
} from "@scripts/infrastructure";
import { BusinessLogicResolver } from "@contract-types";
import { LOANS_PORTFOLIO_CONFIG_ID } from "../constants";
import { atsRegistry } from "../atsRegistry";

/**
 * Loans Portfolio-specific facets list.
 *
 * Includes core ERC1400/ERC3643 facets plus LoansPortfolio-specific facets.
 */
const LOANS_PORTFOLIO_FACETS = [
  // Core Functionality (10)
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
  "TotalBalanceFacet",

  // ERC Standards (13)
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

  // Clearing & Settlement (8)
  "ClearingActionsFacet",
  "ClearingHoldCreationFacet",
  "ClearingReadFacet",
  "ClearingRedeemFacet",
  "ClearingTransferFacet",
  "HoldManagementFacet",
  "HoldReadFacet",
  "HoldTokenHolderFacet",

  // External Management (3)
  "ExternalControlListManagementFacet",
  "ExternalKycListManagementFacet",
  "ExternalPauseManagementFacet",

  // Advanced Features (6)
  "AdjustBalancesFacet",
  "LockFacet",
  "NominalValueFacet",
  "ScheduledBalanceAdjustmentsFacet",
  "ScheduledCrossOrderedTasksFacet",
  "ScheduledSnapshotsFacet",

  // Loans Portfolio-specific (2)
  "LoanFacet",
  //  "LoansPortfolioFacet",
] as const;

/**
 * Create loans portfolio token configuration in BusinessLogicResolver.
 *
 * @param blrContract - BusinessLogicResolver contract instance
 * @param facetAddresses - Map of facet names to their deployed addresses
 * @param useTimeTravel - Whether to use TimeTravel variants (default: false)
 * @param partialBatchDeploy - Whether this is a partial batch deployment (default: false)
 * @param batchSize - Number of facets per batch (default: DEFAULT_BATCH_SIZE)
 * @param confirmations - Number of confirmations to wait for (default: 0 for test environments)
 * @returns Promise resolving to operation result
 */
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
