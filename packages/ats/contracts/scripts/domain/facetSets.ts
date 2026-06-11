// SPDX-License-Identifier: Apache-2.0

/**
 * Shared, type-checked facet sets for deployment configurations.
 *
 * Each `createConfiguration.ts` composes its facet list from these tiers plus a
 * small additive delta, instead of hand-maintaining a ~90-entry string array.
 * Every entry is checked against the generated `FacetName` union, so a typo or
 * a renamed facet is a compile error rather than a runtime lookup miss.
 *
 * Tiers are additive only — a domain that needs fewer facets (e.g. depositToken)
 * builds up from a smaller tier; no tier is ever subtracted from. This preserves
 * the project convention of explicit positive facet lists.
 *
 * - `COMMON_TOKEN_FACETS` — present in every token domain.
 * - `EXTENDED_TOKEN_FACETS` — the full-feature set shared by every token domain
 *   except depositToken (snapshots, compliance/KYC, locks, protected variants,
 *   scheduled tasks, ...).
 * - `BOND_COMMON_FACETS` — shared by the three bond variants on top of the two
 *   token tiers (coupons, maturity, interest rate, principal, ...).
 *
 * @module domain/facetSets
 */

import type { FacetName } from "./atsRegistry";

/**
 * Facets present in every token domain.
 */
export const COMMON_TOKEN_FACETS = [
  "AccessControlFacet",
  "AllowanceFacet",
  "BalanceTrackerByPartitionFacet",
  "BalanceTrackerFacet",
  "BatchBurnFacet",
  "BatchControllerFacet",
  "BatchFreezeFacet",
  "BatchMintFacet",
  "BatchTransferFacet",
  "BurnByPartitionFacet",
  "BurnFacet",
  "CapByPartitionFacet",
  "CapFacet",
  "ClearingByPartitionFacet",
  "ClearingFacet",
  "ControlListFacet",
  "ControllerByPartitionFacet",
  "ControllerFacet",
  "ControllerHoldByPartitionFacet",
  "CoreFacet",
  "CustomDataFacet",
  "DeactivateFacet",
  "DiamondFacet",
  "DocumentationFacet",
  "ExternalControlListManagementFacet",
  "FreezeFacet",
  "HoldByPartitionFacet",
  "HoldFacet",
  "InitializerFacet",
  "MintByPartitionFacet",
  "MintFacet",
  "NominalValueFacet",
  "OperatorByPartitionFacet",
  "OperatorClearingByPartitionFacet",
  "OperatorClearingHoldByPartitionFacet",
  "OperatorFacet",
  "OperatorHoldByPartitionFacet",
  "PartitionsFacet",
  "PauseFacet",
  "SecurityHoldersFacet",
  "TransferByPartitionFacet",
  "TransferFacet",
] as const satisfies readonly FacetName[];

/**
 * Full-feature facets shared by every token domain except depositToken.
 */
export const EXTENDED_TOKEN_FACETS = [
  "AdjustBalancesFacet",
  "BalanceTrackerAdjustedFacet",
  "BalanceTrackerAtSnapshotByPartitionFacet",
  "BalanceTrackerAtSnapshotFacet",
  "ClearingAtSnapshotByPartitionFacet",
  "ClearingAtSnapshotFacet",
  "ComplianceByPartitionFacet",
  "ComplianceFacet",
  "CoreAdjustedFacet",
  "CoreAtSnapshotFacet",
  "CorporateActionsFacet",
  "EIP712Facet",
  "ERC20PermitFacet",
  "ERC20VotesFacet",
  "ExternalKycListManagementFacet",
  "ExternalPauseManagementFacet",
  "FreezeAtSnapshotByPartitionFacet",
  "FreezeAtSnapshotFacet",
  "HoldAtSnapshotByPartitionFacet",
  "HoldAtSnapshotFacet",
  "IdentityFacet",
  "KycFacet",
  "LockAtSnapshotByPartitionFacet",
  "LockAtSnapshotFacet",
  "LockByPartitionFacet",
  "LockFacet",
  "NominalValueAtSnapshotFacet",
  "ProtectedByPartitionFacet",
  "ProtectedClearingByPartitionFacet",
  "ProtectedClearingHoldByPartitionFacet",
  "ProtectedHoldByPartitionFacet",
  "ProtectedPartitionsFacet",
  "RecoveryFacet",
  "ScheduledBalanceAdjustmentFacet",
  "ScheduledCrossOrderedTasksFacet",
  "SecurityHoldersAtSnapshotFacet",
  "SnapshotsByPartitionFacet",
  "SnapshotsFacet",
  "SsiManagementFacet",
  "TransferAndLockByPartitionFacet",
  "TransferAndLockFacet",
] as const satisfies readonly FacetName[];

/**
 * Facets shared by the three bond variants on top of the token tiers.
 */
export const BOND_COMMON_FACETS = [
  "ClearingHoldByPartitionFacet",
  "CouponFacet",
  "CouponListingFacet",
  "CouponSecurityHoldersFacet",
  "InterestRateFacet",
  "MaturityByPartitionFacet",
  "MaturityFacet",
  "NoncesFacet",
  "PrincipalFacet",
  "ProceedRecipientsFacet",
] as const satisfies readonly FacetName[];
