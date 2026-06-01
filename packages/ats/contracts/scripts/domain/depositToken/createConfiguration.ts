// SPDX-License-Identifier: Apache-2.0

/**
 * Deposit Token configuration module.
 *
 * Creates the deposit token configuration in BusinessLogicResolver by calling
 * the generic infrastructure operation with the deposit-token-specific facet
 * list and configuration id.
 *
 * This is a thin wrapper around the generic createConfiguration() operation,
 * providing the deposit-token facet list. Every facet listed here is initialised
 * by `Factory._deployDepositTokenSecurity`, so the set must stay in sync with that
 * function or `setOperationalStatus` will not mark deployed proxies operational.
 *
 * See `docs/DEPOSIT_TOKEN_PLAN.md` for the rationale of every facet listed
 * here.
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
 * Deposit Token Configuration
 *
 * 43 facets total (42 capability facets + InitializerFacet), derived from the
 * capabilities matrix in `docs/DEPOSIT_TOKEN_PLAN.md` §3.
 *
 * Grouped per YES capability plus the always-on initializer + diamond
 * infrastructure block. Capabilities marked FALSE in capabilities.txt
 * (Compliance, KYC, External KYC, External Pause, Protected Partitions,
 * Identity & Claims, Snapshots, Lock, …) have no facet in this list.
 */
const DEPOSIT_TOKEN_FACETS = [
  // Always-on (initializers + diamond infra)
  "AccessControlFacet",
  "DiamondFacet",
  "InitializerFacet", // required by setOperationalStatus / Factory._deployDepositTokenSecurity
  "ControlListFacet", // also = Eligibility
  "CoreFacet", // also = Core
  "CapFacet", // also = Cap

  // NOTE: per capabilities.txt the deposit token excludes Compliance, KYC, External KYC,
  // External Pause, Protected Partitions and Identity & Claims — their facets are deliberately
  // absent from this list (and from Factory._deployDepositTokenSecurity).

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
  "PartitionsFacet", // initializeERC1410 folded in here; ERC1410ManagementFacet removed

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
] as const;

/**
 * Create the deposit token configuration in BusinessLogicResolver.
 *
 * Thin wrapper that calls the generic core operation with deposit-token-specific
 * data:
 * - Configuration ID: DEPOSIT_TOKEN_CONFIG_ID
 * - Facet list: DEPOSIT_TOKEN_FACETS (43 facets)
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
