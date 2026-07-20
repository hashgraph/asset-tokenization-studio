// SPDX-License-Identifier: Apache-2.0

/**
 * Shared, type-checked facet sets for deployment configurations.
 *
 * Every entry is checked against the generated `FacetName` union, so a typo or
 * a renamed facet is a compile error rather than a runtime lookup miss.
 *
 * Single home for every facet set: the shared tiers, the per-class lists
 * (`EQUITY_FACETS`, `BOND_FACETS`, `DEPOSIT_TOKEN_FACETS`, `FACTORY_FACETS`)
 * and {@link ALL_ASSET_FACETS}, the mega-asset union used by the test-only
 * AssetMock configuration. Equity composes from the two token tiers plus an
 * additive delta; bond and depositToken are explicit flat lists. The Ignition
 * builders (deploy) and the ats:blr:* tasks (operation) create the BLR
 * configurations from these lists.
 *
 * Tiers are additive only — a domain that needs fewer facets (e.g. depositToken)
 * builds up from a smaller set; no tier is ever subtracted from. This preserves
 * the project convention of explicit positive facet lists.
 *
 * - `COMMON_TOKEN_FACETS` — present in every token domain.
 * - `EXTENDED_TOKEN_FACETS` — the full-feature set shared by every token domain
 *   except depositToken (snapshots, compliance/KYC, locks, protected variants,
 *   scheduled tasks, ...).
 * - `BOND_COMMON_FACETS` — the bond-specific facets on top of the two token
 *   tiers (coupons, maturity, interest rate, principal, ...).
 */

import type { FacetName } from "./facetKeys";

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
 * Equity-specific facets list.
 *
 * The common token tiers plus the equity-specific facets: dividends, voting,
 * and the supporting interest-rate / proceed-recipients / clearing-hold facets.
 */
export const EQUITY_FACETS: readonly FacetName[] = [
  ...COMMON_TOKEN_FACETS,
  ...EXTENDED_TOKEN_FACETS,
  "ClearingHoldByPartitionFacet",
  "DividendFacet",
  "DividendSecurityHoldersFacet",
  "InterestRateFacet",
  "NoncesFacet",
  "ProceedRecipientsFacet",
  "VotingFacet",
  "VotingSecurityHoldersFacet",
];

/**
 * Bond Token Configuration
 *
 * Explicit flat facet list for the bond token (coupons, maturity, interest
 * rate, principal on top of the common token functionality).
 */
export const BOND_FACETS: readonly FacetName[] = [
  // Core Functionality
  "AccessControlFacet",
  "CapFacet",
  "CapByPartitionFacet",
  "ControlListFacet",
  "CorporateActionsFacet",
  "DiamondFacet", // Combined: includes DiamondCutFacet + DiamondLoupeFacet functionality
  "FreezeFacet",
  "BatchFreezeFacet",
  "KycFacet",
  "PauseFacet",
  "SnapshotsFacet",
  "SnapshotsByPartitionFacet",
  "SecurityHoldersAtSnapshotFacet",
  "HoldAtSnapshotFacet",
  "LockAtSnapshotByPartitionFacet",
  "FreezeAtSnapshotFacet",
  "FreezeAtSnapshotByPartitionFacet",
  "LockAtSnapshotFacet",
  "CoreAtSnapshotFacet",
  "BalanceTrackerFacet",
  "BalanceTrackerAdjustedFacet",
  "BalanceTrackerByPartitionFacet",
  "BalanceTrackerAtSnapshotFacet",
  "BalanceTrackerAtSnapshotByPartitionFacet",
  "ClearingAtSnapshotFacet",
  "ClearingAtSnapshotByPartitionFacet",
  "HoldAtSnapshotByPartitionFacet",

  // Core
  "CoreFacet",

  // Allowance
  "AllowanceFacet",

  // CoreAdjusted
  "CoreAdjustedFacet",
  "InitializerFacet", // Core initializer facet

  //CustomData
  "CustomDataFacet",

  // ERC Standards
  "TransferFacet",
  "MintByPartitionFacet",
  "ProtectedByPartitionFacet",
  "OperatorFacet",
  "TransferByPartitionFacet",
  "PartitionsFacet",
  "OperatorByPartitionFacet",
  "BurnByPartitionFacet",
  "DocumentationFacet",
  "ControllerFacet",
  "ERC20PermitFacet",
  "EIP712Facet",
  "NoncesFacet",
  "DeactivateFacet",
  "ERC20VotesFacet",
  "BatchControllerFacet",
  "BatchBurnFacet",
  "BatchMintFacet",
  "BatchTransferFacet",
  "RecoveryFacet",
  "IdentityFacet",
  "ComplianceFacet",
  "ComplianceByPartitionFacet",
  "MintFacet",
  "BurnFacet",

  // Clearing & Settlement
  "ClearingByPartitionFacet",
  "ProtectedClearingHoldByPartitionFacet",
  "ClearingHoldByPartitionFacet",
  "OperatorClearingHoldByPartitionFacet",
  "ClearingFacet",
  "OperatorClearingByPartitionFacet",
  "ProtectedClearingByPartitionFacet",
  "HoldFacet",
  "OperatorHoldByPartitionFacet",
  "ControllerHoldByPartitionFacet",
  "ControllerByPartitionFacet",
  "ProtectedHoldByPartitionFacet",
  "HoldByPartitionFacet",

  // External Management
  "ExternalControlListManagementFacet",
  "ExternalKycListManagementFacet",
  "ExternalPauseManagementFacet",

  // Advanced Features
  "AdjustBalancesFacet",
  "ScheduledBalanceAdjustmentFacet",
  "CouponFacet",
  "CouponSecurityHoldersFacet",
  "LockFacet",
  "LockByPartitionFacet",
  "MaturityFacet",
  "NominalValueFacet",
  "NominalValueAtSnapshotFacet",
  "ProceedRecipientsFacet",
  "ProtectedPartitionsFacet",
  "ScheduledCrossOrderedTasksFacet",
  "SecurityHoldersFacet",
  "CouponListingFacet",
  "SsiManagementFacet",
  "TransferAndLockFacet",
  "TransferAndLockByPartitionFacet",
  "InterestRateFacet",
  "FixedRateFacet",

  // Maturity By Partition
  "MaturityByPartitionFacet",

  // Jurisdiction-Specific
  "PrincipalFacet",
] as const;

/**
 * Deposit Token configuration: 69 facets (68 capability facets + InitializerFacet).
 *
 * This list still omits the facets for capabilities the deposit token does not expose (KYC,
 * external KYC, external pause, identity, full compliance, …), but includes the snapshot,
 * adjusted-balance, lock, per-partition compliance, income-holder, maturity, protected-partition
 * and voting-holder facets so a deposit-token resolver configuration exposes the full capability
 * set it needs.
 */
export const DEPOSIT_TOKEN_FACETS: readonly FacetName[] = [
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
 * Factory-specific facets list (1 facet).
 *
 * Factory is a single-facet ResolverProxy that handles token deployment.
 */
export const FACTORY_FACETS: readonly FacetName[] = ["FactoryFacet"];

/**
 * Asset-class "type" facets — the per-class additions that sit on top of the shared
 * tiers (the deltas in each domain's `*_FACETS` list that are not already part of
 * `COMMON_TOKEN_FACETS`, `EXTENDED_TOKEN_FACETS`, or `BOND_COMMON_FACETS`).
 *
 * Composes {@link ALL_ASSET_FACETS} together with the shared tiers. A drift test
 * asserts the union below stays a superset of the per-class lists.
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
 * The full union of every asset-class facet, deduplicated.
 *
 * A superset of `EQUITY_FACETS`, `BOND_FACETS`, and `DEPOSIT_TOKEN_FACETS` (a
 * drift test asserts this). Composed here from the shared tiers plus
 * {@link ASSET_TYPE_FACETS} so it stays a single, compile-checked source of
 * truth rather than a hand-maintained ~90-entry list; every input is already
 * `satisfies readonly FacetName[]`, so typos are caught upstream.
 *
 * Production has no single asset that deploys every facet, so this currently has one
 * consumer — the test-only AssetMock "mega-asset" configuration, which passes it through
 * `buildFacetList()` to apply the `DiamondFacet`→`MockDiamondCut` swap and append the
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
