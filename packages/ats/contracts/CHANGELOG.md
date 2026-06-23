# @hashgraph/asset-tokenization-contracts

## 8.0.0

Highlights — Modular Asset Factory release (BREAKING — clean redeploy required):

- Modular Asset Factory: Equity/Bond monoliths replaced by composable micro-facets; asset capabilities are opt-in per deployment.
- ERC-7201 namespaced storage + keccak hash normalisation: every role, resolver key, storage slot, and type-id value changes — clean redeploy required.
- Centralised initialiser system (BBND-1821): `ERC1410ManagementFacet` and `ERC3643ManagementFacet` removed; each capability owns its own readiness initialiser.
- 35 security-audit fixes (FIND-\*) across clearing, holds, recovery, coupon/dividend math, and access control.
- New `BatchController` facet for batch forced-transfer; Clearing, Hold, and Snapshot subsystems refactored into dedicated micro-facets.
- Hash codegen CI gate (`hashes:check`) enforces annotation-to-hex consistency and blocks drift.

### Major Changes

- 72fea42: Refactor batchForcedTransfer from ERC3643Batch contract into a new BatchController facet.
- ffeb27e: Normalise every keccak-derived `bytes32` constant across the ATS contracts package. BREAKING: Every on-chain role hash changes value.
- 0a574c7: Remove the Equity / EquityUSA facet stack and the monolithic BondFacet + SecurityFacet. Extract shared balance-adjustment helpers into a standalone library. BREAKING: IEquity, IEquityUSA, IBond-monolithic removed from Diamond ABI; SecurityType.Equity and SecurityType.Bond removed from IFactory; greenfield redeploy required.
- 849d838: Stop tracking the auto-generated `scripts/domain/atsRegistry.data.ts` in git. BREAKING: FACET_REGISTRY_COUNT -> getFacetRegistryCount(), STORAGE_WRAPPER_REGISTRY_COUNT -> getStorageWrapperRegistryCount().
- 8f7e6ce: Adopt full ERC-7201 namespaced storage discipline across `packages/ats/contracts/`. Closes the loop on the slot-formula work landed in BBND-1674. BREAKING: Every namespaced storage slot under `contracts/domain/` shifts its layout when fields move regions. (BBND-1674)
- f391ac4: Audit FIND-142: `applyRoles` now emits two separate events to distinguish requested from effectively applied role changes (BBND-1783). BREAKING: ABI-breaking and require consumers to regenerate their bindings. (FIND-142, BBND-1783)
- a8053d6: Audit FIND-142: `RolesApplied` now distinguishes requested from effectively applied entries. BREAKING: ABI-breaking and require consumers to regenerate their bindings. (FIND-142)
- 90d5bc6: refactor(facets): remove `ERC1410ManagementFacet` and `ERC3643ManagementFacet` (BBND-1821). BREAKING: RESOLVER_KEY_ERC1410_MANAGEMENT and RESOLVER_KEY_ERC3643_MANAGEMENT removed; initializePartitions/initializeCompliance/initializeIdentity selector signatures change; deployments must be regenerated. (BBND-1821)
- 6ea0fb0: Retire four classes of deprecated storage from the contracts package and ship the long-term resolution of the deferred Tier 4 cleanup. BREAKING: BondDataStorage, EquityDataStorage, ERC1410BasicStorage, ERC20VotesStorage re-slotted; greenfield redeploy required.
- 04a8704: Introduce `HoldByPartitionFacet` by merging `HoldTokenHolderFacet` write ops and partition-scoped read ops from `HoldReadFacet` into a single facet; `IHold` and token configs updated to reference `IHoldByPartition`
- 5f01c28: Refactor getHeldAmountFor and getHoldThirdParty functions from HoldRead contract into a new hold facet.
- 63e3f5c: Use IAsset in SDK for every SC call and change actionTypeId* and actionTypeIndex* to actionIdByType\_ in CorporateActions.
- b99b658: refactor(contracts): centralised facet initialisation, `onlyOperational` gate, and resolver key rename (BBND-1688). BREAKING: applyRoles return type changed to void; all \_XXX_RESOLVER_KEY constants renamed to RESOLVER_KEY_XXX; IClearingActions removed — use IClearing; state-changing functions revert with AssetNotOperational until initialised. (BBND-1688)
- f795fe2: Architectural migration to library-based Diamond pattern: storage wrappers converted to libraries, modifiers consolidated into `CoreModifiers`/`AssetModifiers`, `EvmAccessors` introduced for `msg.sender`/`msg.value` abstraction. BREAKING: addCorporateAction and cancelCorporateAction external functions removed — use per-action commands; internal contract tree reorganised. (BBND-1458, BBND-1459, BBND-1460)
- 3d79ea1: feat(ats-contracts): add BalanceTrackerByPartitionFacet and remove TotalBalanceFacet. BREAKING: ITotalBalance and TotalBalanceFacet deleted — use BalanceTrackerByPartitionFacet; IERC1410.interfaceId changes (ERC-165).
- f71f5bc: feat: split BatchFreezeFacet from FreezeFacet.
- 0d419a8: feat: split BurnByPartitionFacet from ERC1410TokenHolderFacet.
- c5b8a94: feat: ClearingByPartitionFacet — split 12 partition-scoped clearing functions out of ClearingActionsFacet, ClearingRedeemFacet, ClearingTransferFacet, and ClearingReadFacet into a new dedicated facet. Breaking: IClearingActions, IClearingRedeem, IClearingTransfer, and IClearingRead interfaceIds all change.
- 6e12e4c: ClearingFacet absorbs `initializeClearing` BREAKING: IClearingActions interface and ClearingActionsFacet removed; IClearing.interfaceId changes; register ClearingFacet instead.
- f075993: Migrate `Coupon` writer + 3 rate variants (`CouponFixedRateFacet`,.
- 7c6d97e: Migrate `DividendFacet` from `contracts/facets/layer_2/dividend/` to the canonical flat. (BBND-1605)
- 7ee4ec9: Refactor `operatorClearingCreateHoldByPartition` from `ClearingHoldCreation` contract into a new `OperatorClearingHoldByPartition` facet, registered under `_OPERATOR_CLEARING_HOLDBYPARTITION_RESOLVER_KEY`.
- ba0aaaf: refactor(KpiLinkedRate): rename facet externals to disambiguate from `SustainabilityPerformanceTargetRate` (BBND-1731). The four `get`/`set` methods get a `KpiLinkedRate` prefix and the initialiser is camel-cased:. (BBND-1731)
- 681d5d9: Extract `getTokenHoldersAtSnapshot` and `getTotalTokenHoldersAtSnapshot` from `SnapshotsFacet` into a new `SecurityHoldersAtSnapshotFacet`, registered under `_SECURITY_HOLDERS_AT_SNAPSHOT_RESOLVER_KEY`.
- f2979e5: Refactor `canTransfer`, `canTransferFrom` (ERC1594), `setCompliance` (ERC3643Management), and `compliance` (ERC3643Read) into a new compliance facet.
- 308289b: Split a new Burn Facet. ERC3643OperationsFacet is empty so is deleted.
- f2979e5: Refactor `canTransfer`, `canTransferFrom` (ERC1594), `setCompliance` (ERC3643Management), and `compliance` (ERC3643Read) into a new compliance facet.
- 2924ef0: Refactor `controllerCreateHoldByPartition` function from `HoldManagement` contract into a new `controllerHoldByPartition` facet.
- f2979e5: Refactor `canTransfer`, `canTransferFrom` (ERC1594), `setCompliance` (ERC3643Management), and `compliance` (ERC3643Read) into a new compliance facet.
- f2979e5: Refactor `canTransfer`, `canTransferFrom` (ERC1594), `setCompliance` (ERC3643Management), and `compliance` (ERC3643Read) into a new compliance facet.
- 560678c: Refactor `getDividendHolders` and `getTotalDividendHolders` out of `DividendFacet` into a new.
- 3d9ace1: Extract `lockedBalanceOfAtSnapshotByPartition` from `SnapshotsFacet` into a new.
- 194defd: Refactor issueByPartition function from ERC1410Issuer contract into a new MintByPartition facet.
- b288300: MAF split: extract OperatorClearingByPartitionFacet with operatorClearingRedeemByPartition (from ClearingRedeemFacet) and operatorClearingTransferByPartition (from ClearingTransferFacet).
- 9883669: MAF split: extract OperatorFacet with isOperator (from ERC1410ReadFacet) and authorizeOperator/revokeOperator (from ERC1410TokenHolderFacet).
- 727033e: Extract `protectedRedeemFromByPartition` and `protectedTransferFromByPartition` from `ERC1410Management` into a new `ProtectedByPartitionFacet` (BBND-1629). Pure capability split — no behaviour change. The new facet is wired into all seven asset archetypes that already include `ERC1410ManagementFacet`. Resolver key `_PROTECTED_BY_PARTITION_RESOLVER_KEY` derived deterministically from `keccak256("security.token.standard.protectedByPartition.resolverKey")`. (BBND-1629)
- fd6d7b4: Extract `protectedClearingRedeemByPartition` (from `ClearingRedeem`) and `protectedClearingTransferByPartition` (from `ClearingTransfer`) into a new `ProtectedClearingByPartitionFacet` (BBND-1630). Pure capability split — no behaviour change. The new facet is wired into all seven asset archetypes that include both source clearing facets. Resolver key `_PROTECTED_CLEARING_BY_PARTITION_RESOLVER_KEY` derived deterministically from `keccak256("security.token.standard.protectedClearingByPartition.resolverKey")`. (BBND-1630)
- f2372c5: Extract `protectedClearingCreateHoldByPartition` from `ClearingHoldCreation` into a new `ProtectedClearingHoldByPartitionFacet` (BBND-1631). The source `ClearingHoldCreation` MAF is fully drained as part of this split: its facet/interface/abstract files are deleted, its resolver key (`_CLEARING_HOLDCREATION_RESOLVER_KEY`) is removed, the orphaned TimeTravel mirror is deleted, and all consumers (`IAsset`, seven `createConfiguration.ts` files, `orchestratorLibraries.ts`, two doc-comments in `clearingHoldByPartition/`) are repointed to the new facet. Resolver key `_PROTECTED_CLEARING_HOLD_BY_PARTITION_RESOLVER_KEY` derived deterministically from `keccak256("security.token.standard.protectedClearingHoldByPartition.resolverKey")`. (BBND-1631)
- 7013af0: Refactor `protectedCreateHoldByPartition` out of `HoldManagementFacet` into a new.
- caaca51: Split recovery capability out of ERC3643Management and ERC3643Read into a new RecoveryFacet. Moves `recoveryAddress` from ERC3643ManagementFacet and `isAddressRecovered` from ERC3643ReadFacet (drained) into the new flat `contracts/facets/recovery/` folder.
- abee626: Extract scheduled balance adjustment selectors from `AdjustBalances` into a new `ScheduledBalanceAdjustment` facet, leaving `AdjustBalances` with only the immediate `adjustBalances` and `triggerAndSyncAll` paths.
- 3bbe0f3: Refactor getSecurityHolders and getTotalSecurityHolders from Security contract into a new SecurityHolders facet.
- 8a474b3: MAF split: extract `partitionsOfAtSnapshot` from `SnapshotsFacet` into a new `SnapshotsByPartitionFacet`.
- 59c2f61: Refactor transfer and transferFrom functions from ERC20 contract, and transferWithData and transferFromWithData functions from ERC1594 contract into a new transfer facet.
- a737023: MAF split: extract `transferByPartition` from `ERC1410TokenHolderFacet` into a new `TransferByPartitionFacet`, draining the source facet.
- e14641c: audit issue FIND-098, kpi rate calculation updated. (FIND-098)
- 144620e: Refactor isIssuable and issue functions from ERC1594 contract and mint function from ERC3643Operations contract into a new mint facet.
- 8e232b0: Refactor addAgent and removeAgent functions from ERC3643Management contract, controllerRedeem, controllerTransfer and finalizeControllable functions from ERC1644 contract, forcedTransfer function from ERC3643Operations contract, isAgent function from ERC3643Read contract and isControllable function from ERC1644 contract into a new controller facet.
- 3a00654: BLR bugs fixed. `getVersionStatus` and `getLatestVersion` method signatures updated; new batched `getLatestVersions(bytes32[])` view added so deploy scripts can avoid the JSON-RPC relay per-IP `eth_call` rate limit.
- 20ead46: ownership added to blr.
- 21ba6f8: createConfiguraiton and createBatchConfiguration methods in the BLR and deployProxy in the Factory now include a data input argument that is simply emitted in the event.
- 26c2584: Remove SustainabilityPerformanceTargetRate facet, its interfaces, storage wrappers, resolver keys, scripts, fixtures, and tests from the codebase.
- 4bbadce: Rename `MetadataFacet` to `CustomDataFacet` across the entire contracts package. BREAKING: setMetadata/getMetadata replaced by setCustomData/getCustomData; ROLE_METADATA_MANAGER replaced by ROLE_CUSTOM_DATA_MANAGER; RESOLVER_KEY_METADATA -> RESOLVER_KEY_CUSTOM_DATA; storage slot changes; redeploy required.
- 9320b3b: Merge `getScheduledSnapshots` and `scheduledSnapshotCount` from the deprecated `ScheduledSnapshotsFacet` into `SnapshotsFacet` and remove the standalone facet.
- cc7e1fe: Normalise every ERC-7201 storage struct to the canonical 5-region banner layout and remove dead per-struct `initialized` fields (now owned by the centralised initializer). BREAKING: ERC-7201 struct field reorder and removal of dead initialized flags shift in-namespace offsets; existing deployments must be redeployed.
- 6701c1f: refactor(contracts): harden Initializer guards, remove stale modifier and utility contracts, and close branch coverage gaps (BBND-1827). BREAKING: setOperationalStatus now requires DEFAULT_ADMIN_ROLE; ContextProvider and LocalContext removed; IFactory.deployBondFixedRate/deployBondKpiLinkedRate and related types removed from production interface. (BBND-1827)
- 3f20512: Extract `getVotingHolders` and `getTotalVotingHolders` from `VotingFacet` into a new dedicated `VotingSecurityHoldersFacet`. BREAKING: getVotingHolders and getTotalVotingHolders removed from IVoting; IVoting.interfaceId changes; register VotingSecurityHoldersFacet to preserve full voting surface.

### Minor Changes

- 8b4258b: Add `nominalValueCurrency` (ISO 4217 `bytes3`) to the `NominalValue` facet. Extends `initializeNominalValue` to accept the currency and adds `setNominalValueCurrency` / `getNominalValueCurrency` external functions, plus the matching SDK command, query, request DTOs, and adapter wiring. Factory forwards `bondDetails.currency` / `equityDetails.currency` on new deploys. Renames `initialize_NominalValue` to `initializeNominalValue` (camelCase, drops the solhint disable). [BBND-1730]. (BBND-1730)
- cf4d8bf: Remove the `version == 0` "use latest" sentinel from `DiamondCutManager` and the.
- beab0e9: Add DepositToken as a new asset type.
- 84c0c22: Migrate 94 facets to Bytes4Builder pattern, eliminating manual bytes4[] array construction.
- aabf9de: audit issue find 004 fixed.
- ae981c5: Fix ERC-20 Transfer event compliance and centralise balance mutation logic. BREAKING: TokenCoreOps.reduceBalanceByPartition, increaseBalanceByPartition, addPartitionTo removed; ERC3643StorageWrapper.transferFrozenBalance removed.
- 94bbc49: Add facets' version to deployment output file, a flag to deploy only a Bond Configuration and a flag to deploy in parallel Facets in networks as Besu (not compatible with Hedera).
- 2968ef6: Introduce FactoryFacet with enhanced factory capabilities for the asset tokenization system.
- 9879296: Feat FIND-033: add force-cancel capability for all corporate action types. (FIND-033)
- c1b3835: Add InterestRateFacet with coupon rate type selector (STANDARD, FIXED, KPI_LINKED).
- 78b262b: check max supply bug fixed.
- 233ab1e: Audit FIND-059: Add `updateLockExpirationByPartition` and `updateLockExpiration` to allow. (FIND-059)
- a4b1f13: unchecked block updated.
- fa68d5d: audit issue FIND-105 foxed. getCouponRaw method implement to return the coupon without interest rate calculation nor snapshot id. (FIND-105)
- 74568b2: audit issue find 146 fixed.
- 378912b: New HashSphere network for smart contracts deployments. Can use parallel facets deployment.
- e78bb17: trigger scheduled task added to some initializers and code refactor.
- 7f1f5da: dead event removed.
- a34b1fa: Add tests in allowance, approve, decreaseAllowance, increaseAllowance functions increase coverage.
- 0dfb7ba: Add LoansPortfolioFacet for LoanPortfolio asset type. Manages a portfolio of loan and cash holdings with classification by collateral, performance status, and country. Includes LoansPortfolioStorageWrapper, full Diamond integration (resolver keys, roles, storage positions), TimeTravel test variant, and a complete integration test suite.
- 0a44a06: removed freeze by partition and unfreeze by partition internal methods.
- 947d70f: BalanceTrackerAdjustedFacet split.
- f6dcd85: BalanceTrackerAtSnapshotByPartitionFacet split.
- 317b632: BalanceTrackerAtSnapshotFacet split.
- e998857: - Add `BatchBurnFacet` with `batchBurn` method, splitting batch burn logic into a dedicated facet registered under `_BATCH_BURN_RESOLVER_KEY`.
- e998857: - Add `BatchMintFacet` with `batchMint`, registering the selector under the new `_BATCH_MINT_RESOLVER_KEY` (`keccak256("security.token.standard.batchmint.resolverKey")`).
- e998857: - Add `BatchTransferFacet` with `batchTransfer` method, splitting batch transfer logic into a dedicated facet registered under `_BATCH_TRANSFER_RESOLVER_KEY`.
- bbac906: CapByPartitionFacet split.
- 2bcbc97: ClearingAtSnapshotByPartitionFacet split.
- 5ff68af: ClearingAtSnapshotFacet split.
- cc0c979: ClearingHoldByPartitionFacet split.
- 8ee00e5: ComplianceByPartitionFacet split.
- 32e1453: ControllerByPartitionFacet split.
- 79c0eb1: refactor: add CoreAtSnapshotFacet for snapshot-based core token property queries.
- e97d1df: CouponListingFacet split. BREAKING: ScheduledCouponListingFacet deleted; register CouponListingFacet instead; IAsset now inherits ICouponListing.
- 9722c83: CouponSecurityHoldersFacet split.
- e96952b: EIP712Facet split.
- 2c3f9ab: FreezeAtSnapshotByPartitionFacet split.
- 3b9e2f6: FreezeAtSnapshotFacet split.
- ba14b9c: HoldAtSnapshot split.
- 2aef6e3: IdentityFacet split.
- b065203: LockAtSnapshot split.
- 362dbfc: LockByPartitionFacet split.
- 328831d: Maturity split.
- aca5672: OperatorByPartition split.
- d1b0667: OperatorHoldByPartition split. BREAKING: HoldManagementFacet and IHoldManagement deleted; register OperatorHoldByPartitionFacet instead.
- fc9b444: PartitionsFacet split + ERC1410ReadFacet removal. BREAKING: ERC1410ReadFacet and IERC1410 umbrella interface removed; drop ERC1410ReadFacet from diamond configurations.
- 8ec1761: Consolidate 8 balance-adjustment functions from `ScheduledBalanceAdjustmentsFacet`, `EquityUSAFacet`, and `ERC1410TokenHolderFacet` into a new `AdjustBalancesFacet`
- f2979e5: Refactor `canTransfer`, `canTransferFrom` (ERC1594), `setCompliance` (ERC3643Management), and `compliance` (ERC3643Read) into a new compliance facet.
- f2979e5: Refactor `canTransfer`, `canTransferFrom` (ERC1594), `setCompliance` (ERC3643Management), and `compliance` (ERC3643Read) into a new compliance facet.
- 63616b8: refactor(contracts): split HoldAtSnapshotByPartition facet out of Snapshots.
- ea110d7: TransferAndLockByPartitionFacet split.
- 612c62d: feat: Add MaturityByPartitionFacet for modular asset faceting (MAF).
- 49cb775: move facets (ssiManagement, nonces, externalPauseManagement, externalKycListManagement, externalControlListManagement, corporateActions, freeze, controlList, pause, accessControl, cap) from layer1 to facets folder.
- 5f851ba: audit issue find-048 fixed, abaf and decimlas overflow checked when creating operation.
- f76e0de: rename isPaused to paused fucntion in Pause Facet and rename Pause events and errors without Token word.
- 70de716: temporary change removing admin check from blr create configuration methods.
- 219207b: audit issue find-117fixed.
- 96f0781: Remove the permissionless T-REX suite deployment surface from the factory and SDK.
- 2917e8e: Metadata facet added.
- 29d7538: audit issue find 147 fixed. clearing hold creations transfer thrid party address to hold.
- bede9bc: Add irreversible token deactivation via `DeactivateFacet`. BREAKING: onlyActivated guard added to state-changing functions; new DEACTIVATE_ROLE and STORAGE_LOCATION_DEACTIVATE introduced.
- 52699b9: unused remove holds deleted.
- 3f07cbe: new initializer facet created.
- f7370ca: partition removal bug fixed. Labaf values updated.
- b782fa9: couponFor token balance bug fixed.

### Patch Changes

- f2455d2: Relocates IProceedRecipients, ProceedRecipients, ProceedRecipientsFacet, ProceedRecipientsKpiLinkedRateFacet from layer_2/proceedRecipient to facets/proceedRecipient. No ABI or logic changes. [BBND-1729]. (BBND-1729)
- eca9fcd: Relocates ScheduledCrossOrderedTasks facets, IScheduledTasksCommon and ScheduledTasksLib out of layer_2/scheduledTask into top-level facets directories.
- 2da0e1d: Relocates ISnapshots, ISnapshotsTypes, Snapshots, SnapshotsFacet from layer_1/snapshot to facets/snapshot.
- e5440a1: Relocates IVoting, IVotingTypes, Voting, VotingFacet from layer_2/voting to facets/voting.
- deb0aae: Consolidate `getTotalBalanceForAdjustedAt` into `TokenCoreOps` as the single source of truth.
- 40fcb8a: Rename `KpisKpiLinkedRateFacet` to `KpisFacet`. [BBND-1764]. (BBND-1764)
- 8e0007f: Move bond-specific facets out of `facets/layer_2/` into top-level `facets/` subdirectories. [BBND-1764]. (BBND-1764)
- 413a3a9: Fix `TREXBaseDeploymentLib.deployTREXSuite` transferring ownership of pre-existing IR/TIR/CTR/MC/IRS to `_tokenDetails.owner`. Ownership is now transferred only for contracts newly deployed in the call, preventing a new token deployment from hijacking shared infrastructure already used by previously deployed tokens.
- ccd68f4: Add PR-gating lint and format CI workflows for ATS and MP, align workflow name prefixes with filenames, pin Node.js version via .nvmrc, and remove obsolete NODE_OPTIONS heap workarounds.
- d1a2507: Fix FIND-071: `removeTokenHolder` did not validate that the holder was registered before executing removal, causing silent state corruption and incorrect holder count when called for non-existent holders. Add `_checkUnexpectedError` guard on `tokenHolderIndex == 0` using new `KPI_ERC1410_REMOVE_HOLDER` error ID. (FIND-071)
- dee49f6: Fix `_recoverSigner` not validating that `ecrecover` returned a non-zero address.
- 825568b: Fix FIND-120: holder incorrectly removed from registry when burning or transferring all free tokens while encumbered tokens (locked/held/cleared/frozen) remain. Replace `_balanceOfAdjustedAt` with `_getTotalBalanceForAdjustedAt` in `ERC1410StorageWrapper.beforeTokenTransfer` for both burn and transfer paths. Update `deployOrchestratorLibraries` deployment order so `ClearingReadOps` is deployed before `TokenCoreOps`, which now depends on it transitively. (FIND-120)
- da5532a: Fix: `batchMint` now validates the cumulative total against `maxSupply` instead of each amount individually.
- d41ffd0: Fix: `batchFreezePartialTokens` and `batchUnfreezePartialTokens` lacked the `onlyFreezeRoles` guard present on their single-holder equivalents, allowing any unprivileged caller to freeze or release arbitrary holders' transferable balances without `ROLE_FREEZE_MANAGER` or `ROLE_AGENT`.
- a838ad3: Fix: `batchTransfer` now validates sender and each destination against the control list and compliance module independently.
- c2cae93: Restore EIP-170 headroom for `ClearingOps` and the hold facet family. PRs #1089 and #1106 pushed `ClearingOps` (25.4 KiB) and `HoldByPartitionFacet` (24.8 KiB) over the 24 KiB runtime cap on 2026-05-13. `ClearingOps` is split into `ClearingOps` (creation + allowance + ABAF + cleared-event emitters) and a new `ClearingLifecycleOps` (approve / cancel / reclaim / dispatch / execution / balance-restoration). The four hold-facet abstracts (`HoldByPartition`, `OperatorHoldByPartition`, `ControllerHoldByPartition`, `ProtectedHoldByPartition`) are switched to call the existing `HoldOps` deployed orchestrator library via DELEGATECALL instead of inlining `HoldStorageWrapper` directly, matching the design intent documented in `HoldOps.sol`. No public ABI changes — every existing selector still resolves through the diamond. Both audit fixes from PRs #1089 and #1106 are preserved. Deployed sizes: ClearingOps 25.4 → 12.4 KiB, ClearingLifecycleOps 19.7 KiB (new); HoldByPartitionFacet 24.8 → 11.6 KiB; ProtectedHoldByPartitionFacet 12.0 → 2.9 KiB; ControllerHoldByPartitionFacet 10.1 → 2.5 KiB; OperatorHoldByPartitionFacet 10.6 → 3.0 KiB.
- 775f36e: Fix: `setCoupon` now rejects coupon `endDate` values that exceed the bond's maturity date.
- 7bdf045: Fix: `getPreviousCouponInOrderedList` now returns 0 when the coupon ID is not found in the ordered list.
- 1cacd76: fix hedera deployments and checkpoints inconsistences (nonce, features not registered,...).
- fb1e020: Add `checkExponentOverflow` guard to `DecimalsLib` and apply it in `BondStorageWrapper`, `DividendStorageWrapper` and `CouponStorageWrapper`.
- 5b8af28: Fix FIND-012: reject zero address in `BusinessLogicResolverWrapper._checkValidKeys`. (FIND-012)
- 8857703: Fix FIND-016: allow `removeExternalPause` to execute when the token is only externally paused. (FIND-016)
- ff38bca: The external pause, control and KYC lists are each iterated in full on the hot path of token.
- 45fdace: Fix FIND-022: reject `address(0)` in `SsiManagementStorageWrapper.addIssuer`. (FIND-022)
- 76325eb: Fix audit finding 024: clearing redeem approval never finalised the burn, leaving orphaned tokens in `totalSupply`.
- 9a343f4: Fix FIND-025: remove `onlyClearingActivated` guard from clearing resolution functions. (FIND-025)
- 521b5a4: Add `NominalValue` facet for Loan and LoanPortfolio asset types with `getNominalValue`/`setNominalValue` and corresponding interfaces. (FIND-031)
- 54a7ce1: Fix FIND-033: exclude disabled corporate actions from pending task aggregations. (FIND-033)
- 139c679: Fix FIND-033: remove try/catch from scheduled task dispatch so failures revert the queue. (FIND-033)
- 61026ac: Fix: `initializeKpiLinkedRate` now validates `interestRate` and `impactData` at initialisation time.
- 0311554: Fix FIND-045: guard against `uint256` underflow when computing the KPI report lookback window in `KpiLinkedRateLib::_collectImpactData`. The expression `fixingDate - reportPeriod` was evaluated without validating that `reportPeriod <= fixingDate`, so a misconfigured `reportPeriod` (greater than the coupon `fixingDate`) reverted every KPI-linked rate calculation. Because the calculation runs from the scheduled-tasks queue, a single bad configuration could permanently freeze coupon processing for the asset. (FIND-045)
- 6772b75: Fix: scheduled tasks now fire at their exact timestamp instead of one block late.
- d132f3f: Fix FIND-047: remove stale and unused `pos` and `scheduledTasksLength` parameters from `ScheduledTasksDispatchOps.execute()`. (FIND-047)
- 50cc8bd: Fix: guard against `uint256` overflow in unbounded multiplications inside the coupon and principal calculation paths.
- 5a111b9: Fix: guard against `uint256` overflow in the dividend amount calculation for large institutional holdings.
- f8f817d: Fix: `recoveryAddress` now rejects a `_newWallet` that has already been used in a prior recovery.
- 5dabf42: Fix: `recoveryAddress` now follows the Checks-Effects-Interactions pattern to prevent re-entrancy.
- 91d8262: Fix: `lockByPartition` and `transferAndLock` no longer return a misleading `bool success_` value.
- 5d553af: Fix FIND-070: `replaceTokenHolder` silently corrupts `tokenHolders[0]` when `oldTokenHolder` is unregistered. (FIND-070)
- 61f7072: Fix FIND-073: enforce sequential nonces in EIP-712 protected operations. (FIND-073)
- 0ae44da: Fix FIND-090: guard against `address(0)` reaching snapshot and batch state-writing functions. (FIND-090)
- 23925cf: Fix FIND-095: update allowance LABAF in `approve` to prevent allowance inflation. (FIND-095)
- 98b74fa: Fix FIND-102: prevent the sole `DEFAULT_ADMIN_ROLE` holder from renouncing, which would permanently lock all admin-gated functions. (FIND-102)
- e2ad209: Fix FIND-109: guard `DecimalsLib.calculateDecimalsAdjustment` against arithmetic overflow. (FIND-109)
- 7c16bef: Fix FIND-111: grant DEFAULT_ADMIN_ROLE to \_tRexOwner in SecurityDeploymentLib.\_prepareRbacs. (FIND-111)
- f95fc0c: Prevent activation of diamond configurations with zero facets. `_activateConfiguration` now reverts with `EmptyFacetConfigurationNotPermitted` when the accumulated facet list for a batch version is empty, closing a vector where `createConfiguration` or `createBatchConfiguration` could register a configuration with no function selectors and brick any `ResolverProxy` following the latest version. [FIND-114]. (FIND-114)
- 9dde45b: Prevent `createConfiguration` from prematurely finalising an in-progress batch. `_createConfiguration` now reverts with `OngoingBatchConfigurationNotPermitted` when `_isOngoingConfiguration` returns true, closing a vector where calling `createConfiguration` on an open batch would absorb partial state and immediately activate the configuration — potentially missing facets intended for subsequent batch additions. [FIND-115]. (FIND-115)
- d8b6174: Fix FIND-120: zero-amount hold execution creates ghost partition, permanently blocking `fullRedeemAtMaturity`. (FIND-120)
- 9df4f1d: Fix FIND-121: `CouponStorageWrapper._calculateCouponAmount` re-read the live `nominalValue` and `nominalValueDecimals` from `NominalValueStorageWrapper`, even when the holder balance and token decimals had been resolved at the snapshot bound to the coupon. When `setNominalValue` (or an ABAF adjustment changing decimal precision) ran between the coupon's record date and a `getCouponFor` / `getCouponAmountFor` query, the numerator and denominator were composed at incompatible scales — inflating or shrinking the fractional payable amount. (FIND-121)
- bb12115: Fix FIND-125: prohibit setting partition max supply to zero and remove the global-cap coherence check. (FIND-125)
- 3f785d3: Fix FIND-127: add missing `onlyUnrecoveredAddress` guards to prevent recovered wallets from calling issue/mint operations and from being targeted by release/hold creation. Added `onlyUnrecoveredAddress(getMsgSender())` to `Mint.issue`, `Mint.mint`, and `BatchMint.batchMint` to block recovered callers; added `onlyUnrecoveredAddress(_tokenHolder)` to `Lock.release` and `LockByPartition.releaseByPartition` to prevent releasing locks back to dead wallets; added `onlyUnrecoveredAddress(_from)` to `ControllerHoldByPartition.controllerCreateHoldByPartition` to block holds on recovered token holders. (FIND-127)
- b724201: Fix FIND-128: guard `controllerCreateHoldByPartition` against active clearing. (FIND-128)
- 161bdcd: Fix FIND-134: align expiration boundary behaviour across all encumbrance types. `HoldStorageWrapper::isHoldExpired` and `ClearingStorageWrapper::requireExpirationTimestamp` used a strict `>` comparison, so holds and clearings were not considered expired at exactly `block.timestamp == expirationTimestamp`, while `LockStorageWrapper::isLockedExpirationTimestamp` used `<=` and treated the same instant as expired. Change both hold and clearing checks from `>` to `>=` so all three encumbrance types share inclusive expiration semantics: an operation is expired at the expiration timestamp, not one second after. (FIND-134)
- 8f248ba: Fix FIND-135: wrap revocation registry call in `try/catch` in `KycStorageWrapper.getKycStatusFor`. (FIND-135)
- 1d916fd: Fix: `addSelectorsToBlacklist` and `removeSelectorsFromBlacklist` now enforce the `onlyUnpaused` modifier.
- 6eaa436: Fix FIND-138: prevent wallet recovery while the token is paused. (FIND-138)
- 13dc199: Compliance module never received `transferred` / `created` / `destroyed` notifications for operations on non-default partitions, letting investors accumulate tokens cross-partition without triggering per-holder or per-transfer compliance checks.
- 778669c: Fix: add `onlyActivated` guard to all role-mutating functions in `AccessControl`.
- 9a7b97f: Fix: reject impact data where baseLine equals maxDeviationFloor or maxDeviationCap.
- 1b0f5ae: Enable `configureYulOptimizer` in the Solidity coverage configuration to fix coverage.
- a034245: Fix BBND-1703: Hiero Solo deployment failure during facet registration. (BBND-1703)
- 544b64d: Fix: add `onlyActivated` guard to all external state-changing functions across all facets.
- 8ef4709: Fix: self-transfer of full balance silently removes holder from registry.
- cf2d0b0: Extract `SecurityFacet` as an independent Diamond facet and fix `InterestRate`/`Kyc` initialisation guards.
- a60f779: Fix stale storage slots left behind by swap-and-pop removal in token holder and document registries.
- 41b61a2: Fix voting power updates on balance-movement paths that previously bypassed `ERC20VotesStorageWrapper.afterTokenTransfer`.
- 8d54a06: Migrate the entire Coupon facet family to library composition (BBND-1710). (BBND-1710)
- 6c83bd8: Relocate `ProtectedPartitions` facet out of `layer_1/` nesting into `facets/protectedPartition/` as part of the POST-MAF layer-flattening effort, and add missing NatSpec documentation to all three files.
- 9d9eac5: Fix: [FIND-005] make the per-holder partition-list snapshot O(1) per mutation to close a partition-spam denial-of-service. (FIND-005)
- 303c70b: Relocate `ERC20Permit` facet out of `layer_1/ERC1400/` nesting into `facets/erc20Permit/` as part of the POST-MAF layer-flattening effort.
- b6fb30f: Relocate `ERC20Votes` facet out of `layer_1/ERC1400/` nesting into `facets/erc20Votes/` as part of the POST-MAF layer-flattening effort.
- 2d94c09: Relocate `Kyc` facet out of `layer_1/` nesting into `facets/kyc/` as part of the POST-MAF layer-flattening effort.
- 58b906b: Relocate `Lock` facet out of `layer_1/` nesting into `facets/lock/` as part of the POST-MAF layer-flattening effort.
- 428d229: Relocate `OperatorClearingHoldByPartition` facet and shared type interfaces out of `layer_1/` nesting into top-level `facets/` subdirectories as part of the POST-MAF layer-flattening effort.
- 1c58076: Relocate `TransferAndLock` facet out of `layer_3/` nesting into `facets/transferAndLock/` as part of the POST-MAF layer-flattening effort.
- 7859e50: Tests: add `Deactivated` coverage for all functions guarded by `onlyActivated`.

## 7.0.0

Highlights — RolesApplied event split, BLR factory data enrichment, audit-fix sweep (BREAKING):

- `RolesApplied` event split into `RolesApplied` + `RolesNotApplied` for clearer on-chain role audit trails (FIND-142).
- BLR `createConfiguration`/`createBatchConfiguration` and factory `deployProxy` enriched with a structured `data` argument emitted in events.
- `ERC1410ManagementFacet` and `ERC3643ManagementFacet` removed as part of centralised initialiser system (BBND-1821).
- MAF layer-flattening: `ERC20Permit` and `ERC20Votes` facets relocated out of `layer_1/ERC1400/` nesting.
- Broad audit-fix sweep (FIND-\*): security findings addressed across clearing, hold, and token-management flows.

### Major Changes

- 0fe41df: refactor split voting functions in a new facet.
- 2502ada: split equity facet from equity facet.
- add9335: split coupon from bondFacet.

### Minor Changes

- 9d8d309: new asset loan.
- be18d8d: Add `AmortizationFacet` for Loan and LoanPortfolio asset types with factor-based amortization, principal-return scheduling, `AmortizationStorageWrapper`, and corresponding interfaces.
- c7d4744: Factory generic method to deploy resolver proxies implemented.
- 6fe8bc2: BLR now checks that business logics keys corresponds to the key returned by the corresponding introspection method of the business logic address when registering new facets. This double check reduces the chances of an admin setting by mistake the wrong address for a facet.

### Patch Changes

- 052272a: Tests updated to use a single asset interface for all facets.
- 777e272: Some minor changes were made in a couple os smart contracts in order to reduce redundant code.

## 6.0.0

Highlights — Clearing/Hold/Snapshot micro-facet extraction, EVMAccessors unification (BREAKING):

- `ClearingFacet`, `ClearingActionsFacet`, `ClearingRedeemFacet`, and `ClearingTransferFacet` introduced as dedicated clearing micro-facets.
- `HoldByPartitionFacet` extracted; `ClearingHoldCreation` and `OperatorClearingHoldByPartition` separated as distinct facets.
- `SnapshotsStorageWrapper` reworked; `getScheduledSnapshots` and `scheduledSnapshotCount` merged into `SnapshotsFacet`.
- Library-based Diamond pattern: storage wrappers converted to libraries, `EvmAccessors` introduced, modifiers consolidated into `CoreModifiers`/`AssetModifiers`.
- Multiple ABI-breaking refactors across clearing, hold, and batch interfaces; redeploy required.

### Major Changes

- 5e58601: Add cancelCorporateAction and rename the calls, commands and queries from dividends to dividend when set or return one.

### Minor Changes

- 2e5fdcf: - Added `balancesOfAtSnapshot` query to retrieve holder balances at specific snapshots with pagination support.
- 9d56586: Restructure contracts folder layout for DDD alignment:.
- 8b538ed: Refactor nominal value in a new facet.

### Patch Changes

- f809d77: Fix downstream project compatibility for contracts package:.

## 5.0.0

Highlights — KPI/sustainability rates, ERC20 allowance management, partition-snapshot balances (BREAKING):

- `KPILinkedRate` and `SustainabilityPerformanceTargetRate` bond coupon rate types introduced.
- `increaseAllowance` and `decreaseAllowance` added to `ERC20Facet` for standards-compliant allowance management.
- `lockedBalanceOfAtSnapshotByPartition` added for partition-scoped locked-balance queries at historical snapshots.
- Breaking ABI changes to clearing and hold interfaces; downstream consumers must regenerate bindings.

### Patch Changes

- f809d77: Fix downstream project compatibility for contracts package:.

## 4.3.0

### Minor Changes

- 5de99bd: Move SecurityFacet to layer_2.

## 4.2.0

### Minor Changes

- c5b2a50: Add support for multiple bond types (Variable Rate, Fixed Rate, KPI Linked, SPT). BREAKING: AssetType check inverted in LifeCycleCashFlowStorageWrapper; use BOND_VARIABLE_RATE/BOND_FIXED_RATE/BOND_KPI_LINKED_RATE/BOND_SPT_RATE instead of display strings.
- a942765: Migrate totalSupply and balances to ERC20 storage with lazy migration strategy.
- 2a26b41: Migrate from ether 5 to ether 6.

### Patch Changes

- 35fde1c: Improve test infrastructure and coverage for contracts scripts:.
- 33e8046: Enhance checkpoint system with step tracking, retry utilities, and CLI management.
- 04e7366: Add CI deployment testing workflow and harden CI pipeline.
- c81bab9: Cleanup and standardize GitHub Actions workflows:.
- e378e82: - Rename test/contracts/unit to test/contracts/integration to accurately reflect test type.
- ad45d49: Fix checkpoint ID format documentation and update step counts in JSDoc comments.
- fe7032f: Refactor integration test helpers to reduce boilerplate and eliminate magic numbers:.

## 4.1.0

### Minor Changes

- 60f35fc: kpi linked interest rate coupons now use the kpi latest facet instead of the kpi oracle.

### Patch Changes

- 5f579dc: Fix all lint issues in contracts package.
- f1bac7a: Add three-layer DCO and GPG signature enforcement via git hooks (commit-msg, pre-push) and developer onboarding script.
- 8ffc87f: Fixed all linting issues and applied code formatting across the codebase. Updated license headers in all source files to use standardized SPDX format (`// SPDX-License-Identifier: Apache-2.0`). Added automated license header validation script (`check-license.js`) that runs during pre-commit to ensure all `.sol`, `.ts`, and `.tsx` files include the required SPDX license identifier.
- bde618b: Refactor registry generator into modular architecture and migrate CLI scripts from ts-node to tsx for faster execution (~3x improvement in startup time).

## 4.0.1

### Patch Changes

- 171b22b: Fix all lint issues in contracts package.
- d1552c7: refactor(scripts): standardize CLI entry points and improve infrastructure.

## 4.0.0

Highlights — Diamond proxy solidification, corporate actions expansion, compliance hardening (BREAKING):

- Diamond proxy upgrade pattern and BLR factory solidified across all asset types.
- ERC1410 management and ERC3643 compliance flows standardised with consistent role-gating.
- Corporate actions (coupon, dividend) scheduling, cancellation, and `CancelCorporateAction`/`AddCorporateAction` admin roles expanded.
- `AmortizationFacet` and `NominalValue` facet added for Loan and LoanPortfolio asset types.
- Multiple patch and minor releases hardening token-management flows across 4.x.

### Major Changes

- 3ba32c9: Audit issues fixes: compliance with ERC1400 standard, pause bypasses removed, dividends calculations errors fixed, hold data stale data updated, duplicated CA not accepted anymore, batch freeze operations and external lists do not accept zero addresses anymore, gas optimizations.
- 6950d41: Code refactor plus Coupon fixing, start and end date added. Four type of bonds exist : standard, fixed rate, kpi linked rate and sustainability performance target rate.
- 8f7487a: EIP712 standard fixed. Now single name (ERC20 token name) and version (BLR version number) used for all facets methods. Nonce facet created to centralized to nonce per user management.

### Minor Changes

- 2d5495e: Increase test coverage for smart contracts by adding comprehensive tests for ERC standards (ERC1410, ERC20, ERC3643, ERC20Permit, ERC20Votes), factory components, bond and equity modules, clearing, access control, external lists, KPIs, and other functionalities. Includes fixes for test synchronization, removal of unused code, and optimization of test fixtures.
- 902fea1: Added Docusaurus and project documentation, renamed the MP package organization, and added a Claude documentation command.
- 1f51771: Centralize deployment file management and enhance for downstream consumption:. BREAKING: WorkflowType simplified to AtsWorkflowType | string; SaveDeploymentOptions<T> and saveDeploymentOutput<T>() now accept any type (removed extends AnyDeploymentOutput constraint).
- b802e88: feat(contracts): add updateResolverProxyConfig operation with comprehensive tests.
- c7ff16f: Add comprehensive upgrade workflows for ATS configurations and infrastructure.
- cbcc1db: Protected Transfer and Lock methods removed from smart contracts and sdk.

### Patch Changes

- dff883d: Fix CI/CD workflow bug where Contracts package was never published to npm due to duplicate SDK publish block. The second publish step now correctly publishes Contracts instead of publishing SDK twice.
- 7f92cd7: Enable parallel test execution with tsx loader for 60-75% faster test runs.
- c10a8ee: Replaced the Hashgraph SDK with the Hiero Ledger SDK.
- 1ecd8ee: Update timestamp format to ISO standard with filesystem-safe characters.
- fa07c70: test(contracts): add comprehensive unit and integration tests for TUP upgrade operations.

## 3.1.0

### Minor Changes

- 1f51771: Centralize deployment file management and enhance for downstream consumption:. BREAKING: WorkflowType simplified to AtsWorkflowType | string; SaveDeploymentOptions<T> and saveDeploymentOutput<T>() now accept any type (removed extends AnyDeploymentOutput constraint).
- b802e88: feat(contracts): add updateResolverProxyConfig operation with comprehensive tests.
- c7ff16f: Add comprehensive upgrade workflows for ATS configurations and infrastructure.

### Patch Changes

- 7f92cd7: Enable parallel test execution with tsx loader for 60-75% faster test runs.
- 1ecd8ee: Update timestamp format to ISO standard with filesystem-safe characters.
- fa07c70: test(contracts): add comprehensive unit and integration tests for TUP upgrade operations.

## 3.0.0

Highlights — CorporateActionsFacet, batch operations, protected partitions (BREAKING):

- `CorporateActionsFacet` introduced; coupon and dividend distribution scheduling system established.
- Batch operations added: `batchSetAddressFrozen`, `batchFreezePartialTokens`, `batchUnfreezePartialTokens`, `batchForcedTransfer`.
- Protected-partition scheme for compliance-controlled partitions introduced.
- Breaking restructure of role constants and resolver-key layout.

### Minor Changes

- e0a3f03: Add bytes operationData to ClearingOperationApproved event in case of creating a new hold to send the holdId or to be used by other operation in the future.

### Patch Changes

- e0a3f03: fix: CI workflow improvements for reliable releases.
- e0a3f03: Lock and Clearing operations now trigger account balance snapshots. Frozen balance at snapshots methods created.

## 2.0.0

Highlights — Initial ERC1400+ERC3643 dual-standard architecture, Diamond proxy, Bond/Equity monoliths (BREAKING):

- Initial ERC1400 + ERC3643 (T-REX) dual-standard security-token architecture established.
- Diamond proxy upgrade pattern and BLR factory introduced.
- Security-token role hierarchy and partition model defined.
- Bond and Equity base facets introduced as monolithic asset-type implementations.

### Major Changes

- c62eb6e: BREAKING: Nominal value decimals added to Bonds and Equities.

### Minor Changes

- c62eb6e: Refactor deployment scripts into modular infrastructure/domain architecture with framework-agnostic provider pattern and automated registry generation. BREAKING: deployment scripts API changed; DeploymentProvider parameter required; import paths changed to @scripts/infrastructure and @scripts/domain.
- c62eb6e: Export missing utilities and enhance deployment tracking.
- c62eb6e: Full redeem at maturity method added to bond lifecycle management.
- c62eb6e: Bond and Equity storage layout updated to avoid breaking changes and maintain consistency with previous versions.
- c62eb6e: Dividend Amount For methods added for equity dividend calculations.
- c62eb6e: Coupon Amount For and Principal For methods added for bond payment calculations.

### Patch Changes

- c62eb6e: Optimize test fixture deployment speed (96% improvement). Improved contract test performance from 47 seconds to 2 seconds per fixture by fixing inefficient batch processing and removing unnecessary network delays.
- c62eb6e: Fix clean imports from /scripts path with Hardhat compatibility. Added `typesVersions` field for legacy TypeScript compatibility and missing runtime dependencies (`tslib` and `dotenv`).
- c62eb6e: Update DEVELOPER_GUIDE.md with current architecture and comprehensive script documentation.
- c62eb6e: Fix base implementation in TotalBalanceStorageWrapper.

## 1.17.0

### Minor Changes

- a36b1c8: Integrate Changesets for version management and implement enterprise-grade release workflow.
