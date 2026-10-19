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

/**
 * Asset-class "type" facets — the per-class additions that sit on top of the shared
 * tiers (the deltas in each domain's `*_FACETS` list that are not already part of
 * `COMMON_TOKEN_FACETS`, `EXTENDED_TOKEN_FACETS`, or `BOND_COMMON_FACETS`).
 *
 * Kept here so {@link ALL_ASSET_FACETS} can be composed without importing the per-class
 * `createConfiguration` modules (which import this file, so importing them back would be
 * circular). A drift test asserts the union below stays equal to the per-class lists.
 */
export const ASSET_TYPE_FACETS = [
  "AmortizationFacet",
  "DividendFacet",
  "DividendSecurityHoldersFacet",
  "FixedRateFacet",
  "KpiLinkedRateFacet",
  "KpisFacet",
  "LoanFacet",
  "LoansPortfolioFacet",
  "VotingFacet",
  "VotingSecurityHoldersFacet",
] as const satisfies readonly FacetName[];

/**
 * The full union of every asset-class facet — all seven asset classes deduplicated.
 *
 * Equal to the deduplicated union of `EQUITY_FACETS`, `BOND_FACETS`,
 * `BOND_FIXED_RATE_FACETS`, `BOND_KPI_LINKED_RATE_FACETS`, `LOAN_FACETS`,
 * `LOANS_PORTFOLIO_FACETS`, and `DEPOSIT_TOKEN_FACETS`. Composed here from the shared
 * tiers plus {@link ASSET_TYPE_FACETS} so it stays a single, compile-checked source of
 * truth rather than a hand-maintained ~90-entry list; every input is already
 * `satisfies readonly FacetName[]`, so typos are caught upstream.
 *
 * Production has no single asset that deploys every facet, so this currently has one
 * consumer — the test-only AssetMock "mega-asset" configuration, which passes it through
 * `buildFacetList()` to append `TimeTravelFacet`, `MockDiamondCutHelpers`, and the
 * test-only `EvmAccessorsFacet`. It is intentionally a production-domain constant (it is
 * a facet *set*, like the tiers) so it is reusable for future registry/config validation.
 */
export const ALL_ASSET_FACETS: readonly FacetName[] = [
  ...new Set<FacetName>([
    ...COMMON_TOKEN_FACETS,
    ...EXTENDED_TOKEN_FACETS,
    ...BOND_COMMON_FACETS,
    ...ASSET_TYPE_FACETS,
  ]),
];
