// SPDX-License-Identifier: Apache-2.0

/**
 * Explicit facet-name → resolver-key-argument map, paired with the hand-pasted
 * literal hex values it documents — no runtime hash computation, no parsing a
 * generated Solidity dump.
 */

import type * as factories from "@contract-types";
import { getMockFacetDefinition } from "./initializeMock/mockFacetsRegistry";

/**
 * Union of every facet contract name known to the system, derived directly
 * from the TypeChain factories instead of a generated registry file.
 *
 * @remarks
 * TypeChain emits one `<Name>__factory` export per contract (including
 * interfaces), flattened into a single barrel regardless of source directory.
 * This type keeps every export whose name ends in `Facet__factory` — which
 * also picks up the handful of `I<Name>Facet` interfaces that carry their
 * own resolver-key annotation (`IComplianceFacet`, `IHoldFacet`)
 * — and excludes the TEST-ONLY mocks under `contracts/test/mocks/`
 * (`MockFactoryFacet`), which are unioned separately as {@link MockFacetName}
 * in `initializeMock/mockFacetsRegistry.ts` and never appear in production
 * deploy lists.
 */
export type FacetName = keyof typeof factories extends infer K
  ? K extends `${infer N}Facet__factory`
    ? N extends `Mock${string}`
      ? never
      : `${N}Facet`
    : never
  : never;

/**
 * The `<Arg>` of the `/// @custom:hash resolverKey <Arg>` annotation for every
 * facet, or `null` when the facet declares no resolver key.
 *
 * @remarks
 * ENTRY ORDER IS THE BLR REGISTRATION ORDER — do not reorder.
 * The order is: every deployable production facet in `facetDeployList("production")`
 * order, then the three facet-named interfaces that carry a resolver-key
 * annotation but have no deploy factory of their own (`IComplianceFacet`,
 * `IDiamondFacet`, `IHoldFacet` — never registered, so their position does not
 * affect BLR versioning), then `TimeTravelFacet` last.
 *
 * `null` entries:
 * - `IDiamondFacet` — the interface declares no `@custom:hash resolverKey`
 *   annotation of its own and genuinely has NO resolver key.
 * - `TimeTravelFacet` — it DOES have a resolver key, but a legacy one that
 *   predates the `@custom:hash` formula and cannot be derived from any
 *   `<Arg>`; its literal value is pasted directly into
 *   {@link RESOLVER_KEYS_BY_FACET} instead.
 */
export const FACET_KEY_ARGS = {
  AccessControlFacet: "AccessControl",
  AdjustBalancesFacet: "BalanceAdjustments",
  AllowanceFacet: "Allowance",
  AmortizationFacet: "Amortization",
  BalanceTrackerAdjustedFacet: "BalanceTrackerAdjusted",
  BalanceTrackerAtSnapshotByPartitionFacet: "BalanceTrackerAtSnapshotByPartition",
  BalanceTrackerAtSnapshotFacet: "BalanceTrackerAtSnapshot",
  BalanceTrackerByPartitionFacet: "BalanceTrackerByPartition",
  BalanceTrackerFacet: "BalanceTracker",
  BatchBurnFacet: "BatchBurn",
  BatchControllerFacet: "BatchController",
  BatchFreezeFacet: "BatchFreeze",
  BatchMintFacet: "BatchMint",
  BatchTransferFacet: "BatchTransfer",
  BurnByPartitionFacet: "BurnByPartition",
  BurnFacet: "Burn",
  CapByPartitionFacet: "CapByPartition",
  CapFacet: "Cap",
  ClearingAtSnapshotByPartitionFacet: "ClearingAtSnapshotByPartition",
  ClearingAtSnapshotFacet: "ClearingAtSnapshot",
  ClearingByPartitionFacet: "ClearingByPartition",
  ClearingFacet: "Clearing",
  // Exception: the annotation spells the tail "Bypartition" (single word),
  // not "ByPartition" — the on-chain hash is locked to that exact text.
  ClearingHoldByPartitionFacet: "ClearingHoldbypartition",
  ComplianceByPartitionFacet: "ComplianceByPartition",
  ComplianceFacet: "Compliance",
  ControllerByPartitionFacet: "ControllerByPartition",
  ControllerFacet: "Controller",
  ControllerHoldByPartitionFacet: "ControllerHoldByPartition",
  ControlListFacet: "ControlList",
  CoreAdjustedFacet: "CoreAdjusted",
  CoreAtSnapshotFacet: "CoreAtSnapshot",
  CoreFacet: "Core",
  CorporateActionsFacet: "CorporateActions",
  CouponFacet: "Coupon",
  CouponListingFacet: "CouponListing",
  CouponSecurityHoldersFacet: "CouponSecurityHolders",
  CustomDataFacet: "CustomData",
  DeactivateFacet: "Deactivate",
  DiamondFacet: "Diamond",
  DividendFacet: "Dividend",
  DividendSecurityHoldersFacet: "DividendSecurityHolders",
  DocumentationFacet: "Documentation",
  // Exception: canonical PascalCase of the EIP712 acronym is "Eip712".
  EIP712Facet: "Eip712",
  // Exception: canonical PascalCase of the ERC20Permit acronym is "Erc20permit".
  ERC20PermitFacet: "Erc20permit",
  // Exception: canonical PascalCase of the ERC20Votes acronym is "Erc20votes".
  ERC20VotesFacet: "Erc20votes",
  // Exception: annotation predates the "Management" suffix on the contract name.
  ExternalControlListManagementFacet: "ExternalControlList",
  // Exception: annotation predates the "Management" suffix on the contract name.
  ExternalKycListManagementFacet: "ExternalKycList",
  // Exception: annotation predates the "Management" suffix on the contract name.
  ExternalPauseManagementFacet: "ExternalPause",
  FactoryFacet: "Factory",
  FixedRateFacet: "FixedRate",
  FreezeAtSnapshotByPartitionFacet: "FreezeAtSnapshotByPartition",
  FreezeAtSnapshotFacet: "FreezeAtSnapshot",
  FreezeFacet: "Freeze",
  HoldAtSnapshotByPartitionFacet: "HoldAtSnapshotByPartition",
  HoldAtSnapshotFacet: "HoldAtSnapshot",
  HoldByPartitionFacet: "HoldByPartition",
  HoldFacet: "Hold",
  IdentityFacet: "Identity",
  InitializerFacet: "Initializer",
  InterestRateFacet: "InterestRate",
  KpiLinkedRateFacet: "KpiLinkedRate",
  KpisFacet: "Kpis",
  KycFacet: "Kyc",
  LoanFacet: "Loan",
  LoansPortfolioFacet: "LoansPortfolio",
  LockAtSnapshotByPartitionFacet: "LockAtSnapshotByPartition",
  LockAtSnapshotFacet: "LockAtSnapshot",
  LockByPartitionFacet: "LockByPartition",
  LockFacet: "Lock",
  MaturityByPartitionFacet: "MaturityByPartition",
  MaturityFacet: "Maturity",
  MintByPartitionFacet: "MintByPartition",
  MintFacet: "Mint",
  NominalValueAtSnapshotFacet: "NominalValueAtSnapshot",
  NominalValueFacet: "NominalValue",
  NoncesFacet: "Nonces",
  OperatorByPartitionFacet: "OperatorByPartition",
  OperatorClearingByPartitionFacet: "OperatorClearingByPartition",
  // Exception: same "Bypartition" spelling as ClearingHoldByPartitionFacet above.
  OperatorClearingHoldByPartitionFacet: "OperatorClearingHoldbypartition",
  OperatorFacet: "Operator",
  OperatorHoldByPartitionFacet: "OperatorHoldByPartition",
  PartitionsFacet: "Partitions",
  PauseFacet: "Pause",
  PrincipalFacet: "Principal",
  ProceedRecipientsFacet: "ProceedRecipients",
  ProtectedByPartitionFacet: "ProtectedByPartition",
  ProtectedClearingByPartitionFacet: "ProtectedClearingByPartition",
  ProtectedClearingHoldByPartitionFacet: "ProtectedClearingHoldByPartition",
  ProtectedHoldByPartitionFacet: "ProtectedHoldByPartition",
  ProtectedPartitionsFacet: "ProtectedPartitions",
  RecoveryFacet: "Recovery",
  ScheduledBalanceAdjustmentFacet: "ScheduledBalanceAdjustment",
  // Exception: annotation arg is the pre-rename facet name.
  ScheduledCrossOrderedTasksFacet: "ScheduledTasks",
  SecurityHoldersAtSnapshotFacet: "SecurityHoldersAtSnapshot",
  // Exception: annotation spells the tail "holders" lower-case.
  SecurityHoldersFacet: "Securityholders",
  SnapshotsByPartitionFacet: "SnapshotsByPartition",
  SnapshotsFacet: "Snapshots",
  SsiManagementFacet: "SsiManagement",
  TransferAndLockByPartitionFacet: "TransferAndLockByPartition",
  TransferAndLockFacet: "TransferAndLock",
  TransferByPartitionFacet: "TransferByPartition",
  TransferFacet: "Transfer",
  VotingFacet: "Voting",
  VotingSecurityHoldersFacet: "VotingSecurityHolders",
  // Interface, not deployed on its own — shares ComplianceFacet's key.
  IComplianceFacet: "Compliance",
  // Interface, not deployed on its own — no resolver-key annotation.
  IDiamondFacet: null,
  // Interface, not deployed on its own — shares HoldFacet's key.
  IHoldFacet: "Hold",
  TimeTravelFacet: null,
} as const satisfies Record<FacetName, string | null>;

/**
 * Every facet name in {@link FACET_KEY_ARGS}, in declaration order (which is
 * also BLR registration order for the deployable subset — see the remarks on
 * {@link FACET_KEY_ARGS}).
 */
export const ALL_FACETS: readonly FacetName[] = Object.keys(FACET_KEY_ARGS) as FacetName[];

/**
 * The three facet-named interfaces with no deploy factory: `IComplianceFacet`
 * and `IHoldFacet` are re-exported resolver keys shared with their concrete
 * facet, and `IDiamondFacet` has no resolver key at all. They are listed in
 * {@link ALL_FACETS} but never deployed or registered.
 */
export const NON_DEPLOYABLE_INTERFACES: readonly FacetName[] = ["IComplianceFacet", "IDiamondFacet", "IHoldFacet"];

/**
 * Every deployable production facet, in BLR registration order:
 * {@link ALL_FACETS} minus the test-only `TimeTravelFacet` and the
 * {@link NON_DEPLOYABLE_INTERFACES}. This is the full facet list that both
 * the Ignition genesis modules and `ats:blr:deploy-system` deploy; every
 * entry has a resolver key in {@link RESOLVER_KEYS_BY_FACET}.
 */
export const PRODUCTION_DEPLOY_FACETS: readonly FacetName[] = ALL_FACETS.filter(
  (name) => name !== "TimeTravelFacet" && !NON_DEPLOYABLE_INTERFACES.includes(name),
);

/**
 * Resolver-key `bytes32` value for every facet that declares one — a literal
 * hex map, pasted by hand once from {@link FACET_KEY_ARGS} via
 * `HASHES.resolverKey(arg)` (`lib/codegen/hashGen.ts`) instead of computed at
 * import time.
 *
 * @remarks
 * To add a facet or change an existing argument: run
 * `npx hardhat ats:hash resolverKey <Arg>` and paste the result here AND in
 * the matching `RESOLVER_KEY_<ARG>` `.sol` constant.
 * `test/scripts/unit/domain/hashConsistency.test.ts` fails with an actionable
 * message if the two literals — or either one and the formula — disagree.
 *
 * Facets absent from this map (only `IDiamondFacet`) have no resolver key —
 * use {@link getResolverKey} for a lookup that throws a clear error instead
 * of returning `undefined`.
 */
export const RESOLVER_KEYS_BY_FACET: Readonly<Record<string, string>> = {
  AccessControlFacet: "0xccc2e755f9225e65f6c822a258c866fc0d57a124ad12c8928adf3ff875ffcd70",
  AdjustBalancesFacet: "0x0d52158578e1e30e77e2dd3caffc1aa31af5397866b92131f66858f01b2e8f01",
  AllowanceFacet: "0x329473cfbe06c7719b3c986b04b90a16a859b86307aad33eea0c3dfe87160ab7",
  AmortizationFacet: "0xc0d83d8b9295f78954b1c7c9648bec9775edf597a57f9f4110883e9ca2134739",
  BalanceTrackerAdjustedFacet: "0xde8fb5b2c9dd63c753422ecea8bad989281451fa65dff90dd686eff691b03805",
  BalanceTrackerAtSnapshotByPartitionFacet: "0x58443162e33b704d1fc5afb40e87bf81357231beefee616de557cc06fef3aba8",
  BalanceTrackerAtSnapshotFacet: "0x2c9af26b5891593b8184a58e38f6c52e42af55578543d14ab176abd1213e3013",
  BalanceTrackerByPartitionFacet: "0x05d2477d09e6a1df45e3e51bd398af7a071f6f282255486cec19b8b5a403bbaf",
  BalanceTrackerFacet: "0xefbff5dcb4e5bf43bf472fd0646991b8b4731876498b2a4248f9aa9aee1a127b",
  BatchBurnFacet: "0x60fbdebafe46599d2a6d6cbec0e554cfdf693e5eb001a783852bbbc82e5c9984",
  BatchControllerFacet: "0x535258ade68566dbac2304c09e172709e8b0ab3f78d2be54014d021ddb03ab58",
  BatchFreezeFacet: "0x6ddbb1869dce32d8e2c9bb2d23fad216723298560b6cceba67890d5a3efe0e5e",
  BatchMintFacet: "0x7575e07f738065de9a6ba5370d7d18b79f7a0b885824780bf5c75784978e9530",
  BatchTransferFacet: "0x01e13672eac45bef2d8d3f1c56eaca6857103f3b72ec9ded3d1f30aa15747d05",
  BurnByPartitionFacet: "0x8d135078123ea705bd40f02ac0cd59ac08da08600b3510ba6150fe0e4a588684",
  BurnFacet: "0xa9ec330b49ea310aaeba8dae3ba4f2a0b94fd35fafb9d8d8afbb804b73d50ce2",
  CapByPartitionFacet: "0x0a9c473b0456240ebc327730dba40a495c5a639839b0c0b30a01db12373f7529",
  CapFacet: "0x88a28e7c45a3ce8d4ca60cd480c98e1b46feb84caec725cb0a6cf96b2c5143b5",
  ClearingAtSnapshotByPartitionFacet: "0xf55083b17a9ba346028d6a5c0772a7d913e0e90b4954f7a8b8e1912dcd383cbd",
  ClearingAtSnapshotFacet: "0xb65566db9291ca49b508408fe1ba503b28ea434b3f9bca05c3a0c4da031f9e86",
  ClearingByPartitionFacet: "0xb63156d6db31ae3207bca0dd4a8a45f227171367d85a3833a0d7a1622212c5ec",
  ClearingFacet: "0xb101eca2006801ca94d6bc86288da88fc7f2ddf39849d3dd96fae75967a3d344",
  ClearingHoldByPartitionFacet: "0x027ca02a0a3de6d790cd3b5ff9c792b4bfc1649964d7737f5c4554992ca9b111",
  ComplianceByPartitionFacet: "0xafad2096960379c99c5eae984f0f4ceddafa69c3e08352bcaf84e804ec4135b6",
  ComplianceFacet: "0x0e30d654f46079d52767224a07d1fe1adc91d7edba6504f2f0adca0fca972180",
  ControllerByPartitionFacet: "0xa75865ef65a8410651c7bfebbfa9b89bd06e0bdf0dba55817ba1a6b49fdb1517",
  ControllerFacet: "0xf020acbcf895b1f0961c02558f58e8e3f0a254c27f0e6287127ac2f43893df46",
  ControllerHoldByPartitionFacet: "0xc415f5239b26cab850bcaca08096196a95d9ea5bab0eed1a6e29ce81490efd33",
  ControlListFacet: "0x7bbee58c68b6e19a08128d25f150956d20a69d1cc049afda563753771781ecc5",
  CoreAdjustedFacet: "0xe190b52312c215f8e240bb53f0aa3e51e31b3005b7fcfb49c730ae523e675cfd",
  CoreAtSnapshotFacet: "0x9f1ab2bcf2a5668b07a2b26155b1c04f30721db434dff2f1e69a3a9b1dc0a039",
  CoreFacet: "0xb54e0c9a42346a2760a44e59035a2b84a61d07bed66a2f24cffe3ca4bae1996f",
  CorporateActionsFacet: "0x4f091e1f288c10131ffc090469e611b913f1f54343e59e44405312d597897db2",
  CouponFacet: "0xe292dde7a8154c59d06fe2333acc2b54d003262aadc39ee2c7b474e6e64add6b",
  CouponListingFacet: "0x91e4a085c95cddedc7143dae7647c320f59b0f0214ed0f49ab95d7cedb4db176",
  CouponSecurityHoldersFacet: "0x8e5fc42839ddbceddb6022f61f5907a3849178cce5cfb82850a28e80140ac9a9",
  CustomDataFacet: "0xfe752225f0f7bb1ac35587b02565558e9fbf467f7354ab27123c0afd1aca9a56",
  DeactivateFacet: "0x13d8bdda80bdc4e1d1af80d2096fdf84affb60341d7b8f44392412162d3c3434",
  DiamondFacet: "0xd9202bb838fd8d0f2866f13141398cfb9fa74cbbbce7449c9158caffa9c509f4",
  DividendFacet: "0xfcc58d1d55d14a1359461bb9cef220b267b9846b01d61bd27d97f7c10c28b445",
  DividendSecurityHoldersFacet: "0x1478127ed7121d4c1f51d4844183242705cd85c8948b44acb7756ecf98830402",
  DocumentationFacet: "0x3ab155fb7c96aefcaa7d730782cb640e5acf33c329d90a706843ae88a03cf1fb",
  EIP712Facet: "0xaa031e71d3d43f715d16d62c62d7573406d29acdf4c080143dab629e08a8402f",
  ERC20PermitFacet: "0xb9b450cd33d22a14f4cc67bea5d1afefac1f0e7c5230fce1b942f751c37a9e6d",
  ERC20VotesFacet: "0x9619bb38c76aac49afb1df75430aefc1314778fe926136a688bf3ae3b5f8c3b7",
  ExternalControlListManagementFacet: "0x1a8f526d3e49a86640ec4a268407478132e285f13c4efbe08c46324306fd6a04",
  ExternalKycListManagementFacet: "0x519d262ce075401982a7a64c60caea0491af317c7b69b7869f8181e8d9cda124",
  ExternalPauseManagementFacet: "0x7a8980089ef3860d6c0e831805ee28105e662952033ce76812e56e346d37bd7e",
  FactoryFacet: "0x9fc26269cc1cb994e66f269ed6b58a5bb0c344a134b9dabd342ac466d48f95c7",
  FixedRateFacet: "0x82f13d957a7f7af45723926c5ca1a184f2d667df5221c37434ce37278a9af521",
  FreezeAtSnapshotByPartitionFacet: "0xac8fcbc19e12e099f6c6cff54357e28a589b49673267c81a18a965da1c7f4744",
  FreezeAtSnapshotFacet: "0x8ca462bf28ae4e7c5b77b86245cfff3caf7f6bdb6308a608cd9315feb2c28631",
  FreezeFacet: "0xad51c3d79dbb37543854270a7bd1c7237cfa425b16cdf4dee9015c20917ced5a",
  HoldAtSnapshotByPartitionFacet: "0xe6aa6abeda5257bb9fda94cbd6583ff73bfc92f42edd2ace846ee45b3cf49f0f",
  HoldAtSnapshotFacet: "0xe4ec7231213c656d430571c2b40cf204f87a626b5ccf0db85527f72470e54a9e",
  HoldByPartitionFacet: "0x3bd50b70b7e42003cb9761c133e88d776c27b53729b463a2d5bf6b36a2fce367",
  HoldFacet: "0x7c2ef14067e573a8580a580634bd7547099c4b82cd9f36610da317d77eacf1f1",
  IdentityFacet: "0xbb0d93867bfe08218b429804914b1d345b2c899740c5dd110cb9c6141a01d36e",
  InitializerFacet: "0xe7caa2e00c841ed2a64c4c95e3981f3bfc29108599fad6e89b04f9483df0bf09",
  InterestRateFacet: "0xc09a5111a37fc8806e149b4a20c17a33a9487c6da8ee95f8a2b8ac31ea8dd2f3",
  KpiLinkedRateFacet: "0x47cd76ae576f0ec85f1abfc652d614750caefe22a465bef2c859f6cb32a89593",
  KpisFacet: "0xc0b75e6f4facfa630926f9653b857eeb3547c604941b210701f53f3b17521743",
  KycFacet: "0xf7fc316b28304fa0b62b8849c3c91a901e72894380ecf746c2bc13e5656549cd",
  LoanFacet: "0x17c2126e932655e91a8e803b275de0a930c4b51a109b751567a95ee5d6bd6eba",
  LoansPortfolioFacet: "0x3f6ea14bbeaea82befb49409b874caf151715c6619ac1d26ba858039b7ece33e",
  LockAtSnapshotByPartitionFacet: "0x7740456ff352a04830411a3fdc359bd086a5d78fd7119bbb62a53c62c1911691",
  LockAtSnapshotFacet: "0x91e5d78963175418e7eb62ff74343d1349d9522d316525e922e145c770cc4d18",
  LockByPartitionFacet: "0x75c5c6d6dd253e4be43d8d1c25a4252f5f54ebdba6f6c99ed34cd03c0e4d5360",
  LockFacet: "0xc2e37f639e1d61db1015540583b9d71f8a33da6410aed2826c6caef1304ebd3a",
  MaturityByPartitionFacet: "0x561e299af2bd67a767eee76558f27470801a9cb97627131141cc55ceb734ccbb",
  MaturityFacet: "0x16825792debc7c17efd86bdf71500575f9ff5d4aa20e3a35031c583437a3ca82",
  MintByPartitionFacet: "0x25ec74149ce0eadddeb82e668365e2e174db7431a04a80bada246f8f7887dadf",
  MintFacet: "0x394ec838636f78e91b7dbb3e4ea567e07bbb3886ab70a66652c40be856ab9b7a",
  NominalValueAtSnapshotFacet: "0xca313777aee568dc14b1700e7be675b73932bbbc4e4f974a9f1321e6d653af74",
  NominalValueFacet: "0xfa54bc09a6a76763f17be0504e29b9c28edd15cdc3432c07f92c2b6962f2fbbe",
  NoncesFacet: "0xd1166cb96f266d69db4d4e49d81acaf5441b16bb11681f2b1b53dcf7e1bd3bf4",
  OperatorByPartitionFacet: "0xfd060cda1c9927203f3914aa0d5916e4c5971977dec4026418bc4fff6d25b277",
  OperatorClearingByPartitionFacet: "0xaad3c9e6cb80e4d01b9e5f316a82f495c3d11d36f8d738b0c2e4bce2d3f6c01c",
  OperatorClearingHoldByPartitionFacet: "0xab5e4afdccea84152256072fb9f39bf08d591a7666557783209dff003658d945",
  OperatorFacet: "0x5c2062c6ba02b76ae0c3884d5c0fdd3416b2012195a964efaa34e09b1fa31c95",
  OperatorHoldByPartitionFacet: "0x2ac9004b9c057e04ee677ec0dda4bf57f4de5a2d382d97b9557aafb2600f257f",
  PartitionsFacet: "0x9caef059931effa6169ed564cfd0d8dac03be612be61f4fc934e8554cfe1c53f",
  PauseFacet: "0x472ad8280a7d90bcd8b7876cad2cd5a4a2d31c116563ace7a685aff94eae8928",
  PrincipalFacet: "0xa3dc20804ebd6f2a06a7e8b8de31712f3d18a73b1963acfa1d25ed86907bd0e6",
  ProceedRecipientsFacet: "0x63388aa198df5944c611b8fcbfd32945c57864f7125a5f95069040087d2b0bb7",
  ProtectedByPartitionFacet: "0x2f9cd983bc92f917e9c55a3f61b8984646d96980224f4712084967ea1d24d62f",
  ProtectedClearingByPartitionFacet: "0x3cbb73b8ee5db791f9534af7a5c9fc09a4cf9adff327a05839f2673a3dc63aae",
  ProtectedClearingHoldByPartitionFacet: "0xc28474cfcf6b32464e9000d064b91827c6c37fd3e06dae932c9447c204c35cc1",
  ProtectedHoldByPartitionFacet: "0x5b77b995d3e53c3e46f114bbf37642ce3169369548c8135b8b11f5cebd3fb07b",
  ProtectedPartitionsFacet: "0x895834530eae98f8a742fe98f3d528d3cce6c6a51af63b495414bdf391180dd7",
  RecoveryFacet: "0x087cb866f812745e77608e4eb4b359ae96b8a0ba2ef9fe8336488e479b72d92a",
  ScheduledBalanceAdjustmentFacet: "0x90c7d769d18188f75b1092289e2465103d06f9c1195bf0ee4b2cf0844a5d6c96",
  ScheduledCrossOrderedTasksFacet: "0x53ea769a267213f8e35c975a0dba3d7d8d73163d53f804c2ac6ea37d6c47c082",
  SecurityHoldersAtSnapshotFacet: "0xf7707140407ccf0d6deaf72844217e3c1383270609a7a75e36def71a3c453b9e",
  SecurityHoldersFacet: "0x744edd4f33c7d5e322286e40155d549553e22329ac9503643bf36fc149504bc9",
  SnapshotsByPartitionFacet: "0x37c825560f21710d66419d4eefeb45ae2dadf078b1db5593749d24a7d38465ee",
  SnapshotsFacet: "0xbc4e3ace00cf7d347ee7bf90737d3091c02f7d6607c195bf0d4b81e33644f0e1",
  SsiManagementFacet: "0xba7dfd151d5ed77cbbf8b00c124c67331edf1e6959e7c0129dc73ee72a9c0016",
  TransferAndLockByPartitionFacet: "0xb5ec128e8657ab00db44aa63e5aeded6689b18978072102b9ccb7788faf87a6e",
  TransferAndLockFacet: "0xe92a301947f21b973cb1007aeba48f2eecd916d05107b6355fc499b783b8f7d9",
  TransferByPartitionFacet: "0xfb16c0ead8e476dfd6f2201a386b6a761b76e01aa6e21786c2d90f10036197d9",
  TransferFacet: "0xdb0637d5ac2d3a8a460b63275e82a566d4b5ac4b9d2d2938f70c6612970a4b64",
  VotingFacet: "0x88b1621426a5ad16c2399cdc8a04b7da54bf8ddf04c60aeb2fe17ad903891b58",
  VotingSecurityHoldersFacet: "0xff4e971334f234a2d839b58b2fef84241254942cef8940a4457d1eecb63882b9",
  // Interface, not deployed on its own — shares ComplianceFacet's key.
  IComplianceFacet: "0x0e30d654f46079d52767224a07d1fe1adc91d7edba6504f2f0adca0fca972180",
  // Interface, not deployed on its own — shares HoldFacet's key.
  IHoldFacet: "0x7c2ef14067e573a8580a580634bd7547099c4b82cd9f36610da317d77eacf1f1",
  // Legacy pre-formula key (TEST-ONLY): predates the `@custom:hash` formula,
  // hand-written as `_TIME_TRAVEL_RESOLVER_KEY` in
  // `contracts/test/testTimeTravel/constants/resolverKeys.sol` —
  // `keccak256("security.token.standard.timeTravel.resolverKey")` (note the
  // `security.token.standard` prefix instead of `asset.tokenization.standard`).
  // Consumed in timetravel mode (`facetEnvironment.ts` appends it via
  // `TEST_ONLY_EXTRAS` to every test configuration); changing it would break
  // every already-registered timetravel BLR. Exempt from the
  // literal-equals-formula check in `hashConsistency.test.ts` for the same
  // reason its {@link FACET_KEY_ARGS} entry is `null`.
  TimeTravelFacet: "0xba344464ddfb79287323340a7abdc770d353bd7dfd2695345419903dbb9918c8",
};

/**
 * Derive the camelCase dot-access alias for a facet name.
 *
 * @remarks
 * Strips the trailing `Facet` suffix and camelCases the remainder, collapsing
 * acronym runs (e.g. `ERC20VotesFacet` -> `erc20Votes`, `EIP712Facet` ->
 * `eip712`, `AccessControlFacet` -> `accessControl`).
 */
function toFacetKey(name: string): string {
  const base = name.replace(/Facet$/, "");
  const tokens = base.match(/[A-Z]+(?=[A-Z][a-z])|[A-Z]?[a-z]+[0-9]*|[A-Z]+[0-9]*|[0-9]+/g) ?? [base];
  return tokens
    .map((token, index) =>
      index === 0 ? token.toLowerCase() : token.charAt(0).toUpperCase() + token.slice(1).toLowerCase(),
    )
    .join("");
}

/**
 * Resolver-key `bytes32` value for every facet that declares one, keyed by a
 * camelCase alias (e.g. `RESOLVER_KEYS.identity`, `RESOLVER_KEYS.accessControl`).
 */
export const RESOLVER_KEYS: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(RESOLVER_KEYS_BY_FACET).map(([name, value]) => [toFacetKey(name), value]),
);

/**
 * Resolve a facet's resolver-key `bytes32` value by name.
 *
 * @remarks
 * Looks up {@link RESOLVER_KEYS_BY_FACET} first, then falls back to the
 * TEST-ONLY mock facet registry (`initializeMock/mockFacetsRegistry.ts`) so
 * callers do not need two separate lookups for production vs. mock facets.
 *
 * @throws When the facet is unknown, or known but declares no resolver key
 *   (only `"IDiamondFacet"`).
 */
export function getResolverKey(name: string): string {
  const fromMap = RESOLVER_KEYS_BY_FACET[name];
  if (fromMap) return fromMap;

  const mockValue = getMockFacetDefinition(name)?.resolverKey?.value;
  if (mockValue) return mockValue;

  throw new Error(`No resolver key registered for facet "${name}"`);
}
