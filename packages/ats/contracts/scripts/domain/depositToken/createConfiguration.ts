// SPDX-License-Identifier: Apache-2.0

/**
 * Deposit Token configuration module.
 *
 * Registers the deposit token configuration in the BusinessLogicResolver by calling the generic
 * createConfiguration() operation with the deposit-token facet list and configuration id. The list
 * defines the resolver configuration a deposit-token proxy resolves against; each facet must be
 * initialised before `setOperationalStatus` can mark a deployed proxy operational.
 *
 * @module domain/depositToken/createConfiguration
 */

import {
  ConfigurationData,
  ConfigurationError,
  OperationResult,
  createBatchConfiguration,
  DEFAULT_BATCH_SIZE,
  RetryOptions,
} from "@scripts/infrastructure";
import { BusinessLogicResolver } from "@contract-types";
import { DEPOSIT_TOKEN_CONFIG_ID } from "../constants";
import { atsRegistry } from "../atsRegistry";

/**
 * Deposit Token configuration: 69 facets (68 capability facets + InitializerFacet).
 *
 * This list still omits the facets for capabilities the deposit token does not expose (KYC,
 * external KYC, external pause, identity, full compliance, …), but includes the snapshot,
 * adjusted-balance, lock, per-partition compliance, income-holder, maturity, protected-partition
 * and voting-holder facets so a deposit-token resolver configuration exposes the full capability
 * set it needs.
 */
const DEPOSIT_TOKEN_FACETS = [
  // Always-on (initializers + diamond infra)
  "AccessControlFacet",
  "DiamondFacet",
  "InitializerFacet", // required by setOperationalStatus
  "ControlListFacet", // also = Eligibility
  "CoreFacet", // also = Core
  "CapFacet", // also = Cap

  // Allowance (includes approve)
  "AllowanceFacet",

  // Balance Tracker
  "BalanceTrackerFacet",
  "BalanceTrackerByPartitionFacet",

  // Transfer
  "TransferFacet",
  "TransferByPartitionFacet",

  // Mint
  "MintFacet",
  "MintByPartitionFacet",

  // Burn
  "BurnFacet",
  "BurnByPartitionFacet",

  // Controller
  "ControllerFacet",
  "ControllerByPartitionFacet",
  "ControllerHoldByPartitionFacet",

  // Operator
  "OperatorFacet",
  "OperatorByPartitionFacet",
  "OperatorHoldByPartitionFacet",
  "OperatorClearingByPartitionFacet",
  "OperatorClearingHoldByPartitionFacet",

  // Partitions
  "PartitionsFacet",

  // Batch
  "BatchControllerFacet",
  "BatchBurnFacet",
  "BatchMintFacet",
  "BatchTransferFacet",
  "BatchFreezeFacet",

  // Freeze
  "FreezeFacet",

  // Cap per-partition
  "CapByPartitionFacet",

  // Clearing
  "ClearingFacet",
  "ClearingByPartitionFacet",
  "ClearingHoldByPartitionFacet",

  // Hold
  "HoldFacet",
  "HoldByPartitionFacet",

  // External Eligibility
  "ExternalControlListManagementFacet",

  // Other YES capabilities
  "SecurityHoldersFacet",
  "DeactivateFacet",
  "DocumentationFacet",
  "CustomDataFacet",
  "NominalValueFacet",
  "PauseFacet",

  // Snapshots
  "SnapshotsByPartitionFacet",
  "BalanceTrackerAtSnapshotFacet",
  "BalanceTrackerAtSnapshotByPartitionFacet",
  "ClearingAtSnapshotFacet",
  "ClearingAtSnapshotByPartitionFacet",
  "CoreAtSnapshotFacet",
  "FreezeAtSnapshotFacet",
  "FreezeAtSnapshotByPartitionFacet",
  "HoldAtSnapshotFacet",
  "HoldAtSnapshotByPartitionFacet",
  "LockAtSnapshotByPartitionFacet",
  "NominalValueAtSnapshotFacet",
  "SecurityHoldersAtSnapshotFacet",

  // Adjusted balances
  "BalanceTrackerAdjustedFacet",
  "CoreAdjustedFacet",

  // Lock
  "LockByPartitionFacet",
  "TransferAndLockByPartitionFacet",

  // Compliance
  "ComplianceByPartitionFacet",

  // Income (coupon / dividend holders)
  "CouponSecurityHoldersFacet",
  "DividendSecurityHoldersFacet",

  // Maturity
  "MaturityByPartitionFacet",

  // Protected partitions
  "ProtectedByPartitionFacet",
  "ProtectedHoldByPartitionFacet",
  "ProtectedClearingByPartitionFacet",
  "ProtectedClearingHoldByPartitionFacet",

  // Voting
  "VotingSecurityHoldersFacet",
] as const;

/**
 * Create the deposit token configuration in BusinessLogicResolver.
 *
 * Thin wrapper that calls the generic core operation with deposit-token-specific
 * data:
 * - Configuration ID: DEPOSIT_TOKEN_CONFIG_ID
 * - Facet list: DEPOSIT_TOKEN_FACETS (69 facets)
 *
 * @param blrContract - BusinessLogicResolver contract instance
 * @param facetAddresses - Map of facet names to their deployed addresses
 * @param useTimeTravel - Whether to use TimeTravel variants (default: false)
 * @param partialBatchDeploy - Whether this is a partial batch deployment (default: false)
 * @param batchSize - Number of facets per batch (default: DEFAULT_BATCH_SIZE)
 * @param confirmations - Number of confirmations to wait for (default: 0 for test environments)
 * @returns Promise resolving to operation result
 */
export async function createDepositTokenConfiguration(
  blrContract: BusinessLogicResolver,
  facetAddresses: Record<string, string>,
  useTimeTravel: boolean = false,
  partialBatchDeploy: boolean = false,
  batchSize: number = DEFAULT_BATCH_SIZE,
  confirmations: number = 0,
  retryOptions?: RetryOptions,
): Promise<OperationResult<ConfigurationData, ConfigurationError>> {
  // When useTimeTravel=true, ALL facets get the TimeTravel suffix (universal mapping)
  // plus the TimeTravelFacet controller. No filtering needed — simplifies deployment logic.
  const facetNames = useTimeTravel
    ? [...DEPOSIT_TOKEN_FACETS.map((name) => `${name}TimeTravel`), "TimeTravelFacet"]
    : [...DEPOSIT_TOKEN_FACETS];

  // Build facet data with resolver keys from registry
  const facets = facetNames.map((name) => {
    // Strip "TimeTravel" suffix to get the base name for registry lookup
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
    configurationId: DEPOSIT_TOKEN_CONFIG_ID,
    facets,
    partialBatchDeploy,
    batchSize,
    confirmations,
    retryOptions,
  });
}
