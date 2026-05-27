// SPDX-License-Identifier: Apache-2.0

/**
 * Deposit Token configuration module.
 *
 * Creates the deposit token configuration in BusinessLogicResolver by calling
 * the generic infrastructure operation with the deposit-token-specific facet
 * list and configuration id.
 *
 * This is a thin wrapper around the generic createConfiguration() operation,
 * providing the minimal facet list required by the 10 target verbs plus the
 * ERC-3643 compliance/identity read+setter surface.
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
 * 50 facets total, derived from the capabilities matrix in
 * `docs/DEPOSIT_TOKEN_PLAN.md` §3.
 *
 * Grouped per YES capability plus the always-on initializer + diamond
 * infrastructure block. Facetas backing capabilities that are NO but
 * whose initializer is called unconditionally by `Factory._deploySecurity`
 * are kept in a clearly-marked TODO block — see the inline comment for
 * removal path.
 */
const DEPOSIT_TOKEN_FACETS = [
  // Always-on (initializers + diamond infra)
  "AccessControlFacet",
  "DiamondFacet",
  "ControlListFacet", // also = Eligibility
  "ERC3643ManagementFacet",
  "CoreFacet", // also = Core
  "CapFacet", // also = Cap

  // ┌──────────────────────────────────────────────────────────────────┐
  // │ TODO — REMOVE WHEN POSSIBLE                                      │
  // │                                                                  │
  // │ These facetas are NOT used by any DepositToken capability        │
  // │ (KYC, External Pause, External KYC, Protected are all NO in the  │
  // │ matrix). They are included only because                          │
  // │ `Factory._deploySecurity` calls their initializers               │
  // │ unconditionally — without them in the configuration the deploy   │
  // │ reverts.                                                         │
  // │                                                                  │
  // │ Cleanup path (out of current scope): introduce a dedicated       │
  // │ `_deployDepositTokenSecurity` private function in `Factory.sol`  │
  // │ that skips these initializers, then remove the four entries      │
  // │ below.                                                           │
  // └──────────────────────────────────────────────────────────────────┘
  "KycFacet", // OFF via internalKycActivated=false
  "ExternalPauseManagementFacet", // OFF via externalPauses=[]
  "ExternalKycListManagementFacet", // OFF via externalKycLists=[]
  "ProtectedPartitionsFacet", // OFF via arePartitionsProtected=false
  // ─── end TODO block ─────────────────────────────────────────────────

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
  "ERC1410ManagementFacet",

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

  // Transfer Compliance
  "ComplianceFacet",
  "ComplianceByPartitionFacet",

  // External Eligibility
  "ExternalControlListManagementFacet",

  // Other YES capabilities
  "SecurityHoldersFacet",
  "DeactivateFacet",
  "DocumentationFacet",
  "MetadataFacet",
  "NominalValueFacet",
  "PauseFacet",
] as const;

/**
 * Create the deposit token configuration in BusinessLogicResolver.
 *
 * Thin wrapper that calls the generic core operation with deposit-token-specific
 * data:
 * - Configuration ID: DEPOSIT_TOKEN_CONFIG_ID
 * - Facet list: DEPOSIT_TOKEN_FACETS (23 facets)
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
