# @hashgraph/asset-tokenization-contracts

## 8.0.0

### Major Changes

- 72fea42: Refactor batchForcedTransfer from ERC3643Batch contract into a new BatchController facet.
- ffeb27e: Normalise every keccak-derived `bytes32` constant across the ATS contracts package.

  Identifiers and keccak inputs now follow a single mechanical rule: generic family first, specific name second. Canonical prefix is `asset.tokenization.standard.` (was `security.token.standard.`).
  - Roles: `<NAME>_ROLE` becomes `ROLE_<NAME>` (e.g. `BOND_MANAGER_ROLE` -> `ROLE_BOND_MANAGER`). `DEFAULT_ADMIN_ROLE = 0x00` keeps its OpenZeppelin-compatible shape.
  - Resolver keys: legacy `_<NAME>_RESOLVER_KEY` constants in `constants/resolverKeys.sol` move to file scope inside each `I<Feature>.sol` as `RESOLVER_KEY_<NAME>`. The central file is deleted.
  - Storage locations: legacy `_<NAME>_STORAGE_POSITION` constants in `constants/storagePositions.sol` move into the matching `*StorageWrapper.sol` as `STORAGE_LOCATION_<NAME>`. The slot values now derive from the ERC-7201 formula `keccak256(abi.encode(uint256(keccak256(<id>)) - 1)) & ~bytes32(uint256(0xff))`. The central file is deleted.
  - Corporate-action and scheduled-task type ids move to a new `constants/dispatchTypes.sol`. EIP-712 typehashes move to a new `constants/eip712.sol` and stay as foldable `keccak256("typedef")` literals.

  A new TypeScript codegen (`scripts/codegen/hashGen.ts` + `applyHashGen.ts`) is the single source of truth for the hex values. Annotate any new `bytes32 constant` with `/// @custom:hash <kind> <PascalArg>` and run `npm run ats:contracts:hashes:generate`. CI gate `hashes:check` (in `105-flow-ats-static-checks.yaml`) blocks any drift between annotation and hex, plus duplicate `(kind, arg)` annotations, duplicate identifiers, hash-shaped constants missing an annotation, and non-canonical PascalCase args.

  Breaking changes for downstream consumers:
  - Every on-chain role hash changes value. Role grants on existing deployed assets are invalid.
  - Every namespaced storage slot changes value (ERC-7201 derivation). Existing deployed proxies would read from the wrong slots.
  - Every resolver key changes value. BLR configurations must be rebuilt.
  - Every corporate-action and scheduled-task type id changes value.
  - EIP-712 typehashes are unchanged - same typedef text, solc folding identical.
  - SDK `SecurityRole` enum keeps its member names; only the hex literals are updated.

  Incidental fix: `LOAN_CORPORATE_ACTION_TYPE` was a hand-rolled value (`0x8f3e2a1b...0e1f`), not a real keccak. Codegen now emits the correct `CORPORATE_ACTION_TYPE_LOAN` hash.

- 0a574c7: Remove the Equity / EquityUSA facet stack and the monolithic BondFacet + SecurityFacet. Extract shared balance-adjustment helpers into a standalone library.

  What changes:
  - **Deleted facets**: `Equity` (layer_2), `EquityUSA` / `EquityUSAFacet` (layer_3), and their modifier `EquityModifiers`. The `BondRead` monolithic facet and `SecurityStorageWrapper` are also removed; their responsibilities are now distributed across dedicated micro-facets (`Maturity`, `NominalValue`, `ProceedRecipients`, `FixedRate`, `KpiLinkedRate`, `Security`).
  - **Deleted storage**: `EquityStorageWrapper`, `BondStorageWrapper`, and `SecurityStorageWrapper` are removed. No on-chain migration is required — this is a greenfield redeployment.
  - **New library**: `contracts/domain/orchestrator/BalanceAdjustmentOps.sol` — a pure library (no storage slot) that centralises the six balance-adjustment helpers previously embedded in `EquityStorageWrapper`. Consumed by `DividendStorageWrapper`, `VotingStorageWrapper`, and `ScheduledBalanceAdjustmentFacet`.
  - **Factory**: `deployEquity` ABI is preserved byte-for-byte on `IFactory` / `Factory`; the implementation body is removed. `deployBond` and related equity/bond enum variants are removed from `SecurityType`.
  - **IAsset**: Equity and Bond interface references removed from the aggregate interface.
  - `EquityDataStorage.currency` and `BondDataStorage.currency` fields are gone; denomination currency is now owned exclusively by `NominalValueDataStorage.nominalValueCurrency`.

  Breaking changes for downstream consumers:
  - `IEquity`, `IEquityUSA`, `IEquityUSAFacet`, `IBond`-monolithic, and `ISecurity`-wrapper are no longer part of the Diamond ABI. Any SDK or off-chain code that calls these selectors must be updated to use the equivalent micro-facet surfaces.
  - `SecurityType.Equity` and `SecurityType.Bond` enum variants are removed from `IFactory`. Callers must use `BondFixedRate`, `BondVariableRate`, or `BondKpiLinkedRate` directly.
  - Deployed tokens retain their state; newly deployed tokens will not include the removed facets in their Diamond configuration.

- 849d838: Stop tracking the auto-generated `scripts/domain/atsRegistry.data.ts` in git
  and ship the heavy facet/contract/storage-wrapper registry through the
  package's `build/` output instead. The file is renamed to
  `scripts/domain/atsRegistry.generated.ts`, gitignored, and regenerated on
  every `npm install` / `npm ci` via a new `prepare` hook that runs
  `npx hardhat compile`.

  Role hashes are now emitted into a small sibling file,
  `scripts/domain/atsRoles.generated.ts`, which **is** checked into git so
  role-hash changes remain visible in PR diffs for audit.

  `scripts/domain/atsRegistry.ts` exposes the registry data through lazy
  helpers and `Proxy`-backed raw exports so the bootstrap chain
  (`hardhat.config.ts` → tasks → `@scripts` barrel) never touches the
  gitignored file at module load.

  Breaking surface for downstream consumers of
  `@hashgraph/asset-tokenization-contracts/scripts`:
  - `FACET_REGISTRY_COUNT` (constant) → `getFacetRegistryCount()` (function).
  - `STORAGE_WRAPPER_REGISTRY_COUNT` (constant) → `getStorageWrapperRegistryCount()`
    (function).

  The raw `FACET_REGISTRY`, `INFRASTRUCTURE_CONTRACTS`,
  `STORAGE_WRAPPER_REGISTRY`, and `ROLES` exports remain available with their
  existing names and types; they are now backed by lazy proxies / a checked-in
  roles file rather than direct re-exports.

- 8f7e6ce: Adopt full ERC-7201 namespaced storage discipline across `packages/ats/contracts/`. Closes the loop on the slot-formula work landed in BBND-1674.

  What changes:
  - Every top-level storage struct under `contracts/domain/{asset,core}/` now carries `/// @custom:storage-location erc7201:security.token.standard.storage.<PascalName>` directly above its declaration. Tools that recognise the annotation (`forge inspect storage-layout`, Slither, OpenZeppelin upgrades plugin) now see the namespace.
  - Every storage struct is reorganised into the v8.0.0 five-region layout: lifecycle bool flags → packed scalars (`uint8`, `bytes3`, `address`, enum) → single-slot scalars (`uint256`, `bytes32`, `string`) → aggregates (mapping, array, `EnumerableSet.*`, checkpoint arrays). Each region carries a one-line separator and the struct terminates with a single `// ─── APPEND-ONLY ZONE BELOW ───` marker. Post-v8.0.0 additions must append below the marker; the boundary is greppable and audit-visible.
  - `BondDataStorage.currency` and `EquityDataStorage.currency` are deleted. `NominalValueDataStorage.nominalValueCurrency` is now the single on-chain source of truth for denomination currency; Bond/Equity readers delegate via `NominalValueStorageWrapper.getNominalValueCurrency()`.
  - `NominalValueDataStorage`: `bytes3 nominalValueCurrency` hoisted into slot 0 next to `bool initialized` and `uint8 nominalValueDecimals`. Saves one slot per token.
  - Storage struct hoisting: each `*DataStorage` struct previously declared inside its library `{ ... }` body is hoisted to file scope, paired with the `STORAGE_LOCATION_*` constant in the same file. Where a storage struct previously shared a type with an interface DTO, the two are split: the storage struct lives in the wrapper file, the public DTO lives on the facet interface.

  Slot-packing wins beyond the regional reorder:
  - `LoanDataStorage` 27 fields repacked — slot 0 packs `bool initialized` + `bytes3 currency` + 8× `uint8` enum-typed fields. ~3 slots saved versus declaration order.
  - `EquityDataStorage` 7 right-bools + `dividendRight` enum + `initialized` all pack into slot 0 (10 bytes used).
  - `ERC1410BasicStorage`, `ClearingDataStorage`, `KycStorage`, `ERC3643Storage`, `LoansPortfolioDataStorage`, `ERC20VotesStorage`: lifecycle flags hoisted to slot 0; downstream layout normalised.
  - `AdjustBalancesStorage`, `SnapshotStorage`, `KpisDataStorage`: scalar field moved from a later slot to slot 0.

  Out of scope (intentionally untouched):
  - `InitializerStorageWrapper` field order — owned by the parallel init-system refactor; only the marker and region separators are added here.
  - The `bool initialized` flags on every wrapper are preserved verbatim. The init-system refactor will remove them in a subsequent change; the current ordering minimises that future diff.
  - `ScheduledTasksDataStorage` shape — it's a generic ordered-task queue backing four different ERC-7201 namespaces in `ScheduledTasksStorageWrapper.sol`. A `@dev` block lists the four bindings; no `@custom:storage-location` is applied because no single annotation can capture the four-slot reuse.
  - `ExternalListDataStorage` — single struct backs `ControlListManagement` and `KycManagement`. Annotated with the first slot's namespace; the second is documented inline.
  - `LoansPortfolio` country-tracking surface (`loanHoldingsAssetsByCountryKeys`, `countryNames`, `loanHoldingsAssetsByCountry`) kept verbatim per the external-team requirement.

  Breaking changes for downstream consumers:
  - Every namespaced storage slot under `contracts/domain/` shifts its layout when fields move regions. Existing deployed proxies would read garbage and corrupt state on first write — v8.0.0 is a clean redeploy. Old token state cannot be migrated in place.
  - ABI surface and selectors are unchanged for `IERC20`, `IERC20Metadata`, `ICore`, `IERC3643`, and every other facet interface. EIP-165 `interfaceId` values are unchanged. SDK and TypeChain consumers see no public surface change.

- f391ac4: Audit FIND-142: `applyRoles` now emits two separate events to distinguish requested from effectively applied role changes (BBND-1783).
  - `RolesApplied(bytes32[] roles, bool[] actives, address account)` retains its original signature and fires for every batch call, reflecting all requested operations.
  - New `EffectivelyRolesApplied(bytes32[] roles, bool[] actives)` is emitted only for entries that resulted in an effective storage mutation. Off-chain indexers can subscribe to this event to track actual state changes without filtering no-ops.
  - `applyRoles` no longer returns `bool success_`; the function reverts on failure and otherwise always completes.
  - The unreachable `RolesNotApplied` error declaration was removed from `IAccessControl`.

  All four modifications are ABI-breaking and require consumers to regenerate their bindings.

- a8053d6: Audit FIND-142: `RolesApplied` now distinguishes requested from effectively applied entries.

  The event carries two new fields, `appliedRoles` and `appliedStates`, populated only with the
  entries whose state effectively changed. Existing `actives` parameters on the event were
  renamed to `states` for clarity. Off-chain indexers can now tell which roles actually
  mutated versus which were no-ops.

  Additional changes in the same scope:
  - The `applyRoles` external function no longer returns `bool success_`; the function reverts
    on failure (admin check) and otherwise always completes.
  - The unreachable `RolesNotApplied` error declaration was removed from `IAccessControl`.

  Both modifications are ABI-breaking and require consumers to regenerate their bindings.

- 90d5bc6: refactor(facets): remove `ERC1410ManagementFacet` and `ERC3643ManagementFacet` (BBND-1821).

  Both facets existed solely to host a single-shot initialiser. Under the centralised initializer system, each capability already had its own readiness initialiser on the natural-owner facet, so the management facets were redundant. Their data-carrying initialisers are folded into those owner facets, dropping two facets, two resolver keys and two interface ids from the diamond.
  - `ERC1410ManagementFacet` removed. `PartitionsFacet.initializePartitions` now takes the `bool multiPartition` argument and writes it to ERC-1410 storage before marking the facet ready.
  - `ERC3643ManagementFacet` removed. Its compliance/identity wiring is split into `ComplianceFacet.initializeCompliance(address)` and `IdentityFacet.initializeIdentity(address)`.
  - `initializeCompliance`, `initializeIdentity` and `initializePartitions` now emit their `*Initialized` events with the wired value. One-shot semantics stay enforced by the centralised `onlyFacetNotRegistered` guard; no per-namespace storage flags are introduced.
  - `IERC3643` no longer inherits `IERC3643Management`; `IAsset` no longer inherits `IERC1410Management`. The factory bootstrap calls the three owner-facet initialisers directly.

  Breaking impact: deployments must be regenerated. The `RESOLVER_KEY_ERC1410_MANAGEMENT` and `RESOLVER_KEY_ERC3643_MANAGEMENT` facets, keys and interface ids are removed, and the `initialize{Partitions,Compliance,Identity}` selectors change signature. No storage-layout change.

- 6ea0fb0: Retire four classes of deprecated storage from the contracts package and ship the long-term resolution of the deferred Tier 4 cleanup.

  Storage retirements: the orphaned ERC20Permit storage slot and its struct; the bond/equity nominal-value migration shim and its test facet; the ERC1410-to-ERC20 totalSupply/balances migration shim and its test facet; and the trailing deprecated name/version/nonces fields on ProtectedPartitions and ERC20Votes. Re-slots BondDataStorage, EquityDataStorage, ERC1410BasicStorage, and ERC20VotesStorage — greenfield deployment required.

  ScheduledTasksOps orchestrator: new external library following the same pattern as HoldOps and TokenCoreOps. Nine production callers (KpiLinkedRate, ProceedRecipients facets, ERC1410StorageWrapper, ERC20VotesStorageWrapper, NominalValueStorageWrapper) now DELEGATECALL into the standalone library instead of the legacy self-CALL helper, saving roughly 2000 gas per invocation. Removes callTriggerPendingScheduledCrossOrderedTasks from ScheduledTasksStorageWrapper. Pause-guard preserved at the orchestrator boundary so Burn / Transfer / ERC1594 / BurnByPartition facets keep their cascading IsPaused revert semantics.

- 04a8704: Introduce `HoldByPartitionFacet` by merging the former `HoldTokenHolderFacet` (write operations: `createHoldByPartition`, `createHoldFromByPartition`, `executeHoldByPartition`, `releaseHoldByPartition`, `reclaimHoldByPartition`) with the partition-scoped read operations previously in `HoldReadFacet` (`getHeldAmountForByPartition`, `getHoldCountForByPartition`, `getHoldsIdForByPartition`, `getHoldForByPartition`) into a single facet registered under `_HOLD_BY_PARTITION_RESOLVER_KEY`. The old `HoldTokenHolderFacet` and `IHoldTokenHolder` are removed. `IHold` and all token configurations now reference `IHoldByPartition`. SDK adapters updated to use `IAsset__factory` for the affected hold operations.
- 5f01c28: Refactor getHeldAmountFor and getHoldThirdParty functions from HoldRead contract into a new hold facet.
- 63e3f5c: Use IAsset in SDK for every SC call and change actionTypeId* and actionTypeIndex* to actionIdByType\_ in CorporateActions
- b99b658: refactor(contracts): centralised facet initialisation, `onlyOperational` gate, and resolver key rename (BBND-1688).
  - `InitializerStorageWrapper` pattern applied to all facets: `onlyRole(DEFAULT_ADMIN_ROLE)` + `onlyFacetNotRegistered(RESOLVER_KEY_XXX)` → `setFacetToReady(RESOLVER_KEY_XXX)` → emit `XxxInitialized()`. Subsequent calls revert with `FacetAlreadyRegistered`.
  - Existing boolean guards migrated: AccessControl, BondUSA (fixed/KPI/variable), Cap, CapByPartition, ControlList, EquityUSA, Security.
  - `initializeXxx` added to ~70 facets that had no prior initialisation guard.
  - Virtual resolver-key pattern (`_bondInitializerKey()`, `_transferAndLockInitializerKey()`, etc.) introduced for abstract base facets shared across multiple concrete types.
  - `onlyOperational` gate added to all state-changing functions; `Factory._deploySecurity()` calls every initialiser before marking the proxy operational via `_SECURITY_FACETS_MAX`.
  - Resolver keys renamed from `_XXX_RESOLVER_KEY` to `RESOLVER_KEY_XXX` and moved from `constants/resolverKeys.sol` to each facet's own interface file.
  - `applyRoles` no longer returns `bool`; `RolesNotApplied` removed; `RolesApplied` gains `appliedRoles` + `appliedStates` parameters.
  - Empty contracts removed: `AmortizationStorageWrapper.sol`, `LoanStorageWrapper.sol`, `NominalValueModifiers.sol`, `ERC20Modifiers.sol`, `ExternalListModifiers.sol`.
  - Mass-payout: `AssetMock` gains `initializeBalanceAdjustments` stub.

  Breaking changes: state-changing functions revert with `AssetNotOperational` until fully initialised. `SecurityModifiers.sol` and `onlyNotSecurityInitialized` removed. `IClearingActions` removed — use `IClearing`/`ClearingFacet`. All `_XXX_RESOLVER_KEY` constants renamed to `RESOLVER_KEY_XXX` and moved to interface files. `applyRoles` return type changed to `void`; `RolesApplied` event gains two new parameters.

- f795fe2: Architectural migration: library-based Diamond pattern (BBND-1458 / BBND-1459 / BBND-1460). Converts every storage wrapper from an abstract contract to a library, consolidates modifiers into `CoreModifiers` and `AssetModifiers` aggregators under `services/`, introduces `EvmAccessors` for `msg.sender` abstraction (replacing the old `TimestampProvider` / direct `msg.sender` usage), and reorganizes the contracts tree into `domain/` (core + asset), `facets/` (layer_1 / layer_2 / layer_3) and `infrastructure/` (diamond, proxy, utils). Existing storage slots and public facet entry points are preserved, so downstream ABIs for already-deployed tokens remain compatible — the major bump signals the internal rewrite and the removal of the top-level `addCorporateAction` / `cancelCorporateAction` external functions (replaced by per-action commands).
- 3d79ea1: feat(ats-contracts): add BalanceTrackerByPartitionFacet and remove TotalBalanceFacet

  Introduces `BalanceTrackerByPartitionFacet` with three partition-scoped read functions:
  - `balanceOfByPartition` (moved from `ERC1410ReadFacet`)
  - `totalSupplyByPartition` (moved from `ERC1410ReadFacet`)
  - `getTotalBalanceForByPartition` (moved from `TotalBalanceFacet`, which is removed)

  **Breaking changes:**
  - `IERC1410Read` no longer declares `balanceOfByPartition` or `totalSupplyByPartition`; these are now on `IBalanceTrackerByPartition`. This changes `IERC1410.interfaceId` (ERC-165).
  - `TotalBalanceFacet` and its interface `ITotalBalance` are deleted. Use `BalanceTrackerByPartitionFacet` instead.
  - All token configurations updated to replace `TotalBalanceFacet` with `BalanceTrackerByPartitionFacet`.

- f71f5bc: feat: split BatchFreezeFacet from FreezeFacet

  Move batchSetAddressFrozen, batchFreezePartialTokens, and batchUnfreezePartialTokens into a dedicated BatchFreezeFacet. FreezeFacet retains the four single-address operations. Removes these selectors from IFreeze, which changes its ERC-165 interfaceId.

- 0d419a8: feat: split BurnByPartitionFacet from ERC1410TokenHolderFacet

  Move redeemByPartition into a dedicated BurnByPartitionFacet. ERC1410TokenHolderFacet retains the six remaining operations. Removing redeemByPartition from IERC1410TokenHolder changes its ERC-165 interfaceId.

- c5b8a94: feat: ClearingByPartitionFacet — split 12 partition-scoped clearing functions out of ClearingActionsFacet, ClearingRedeemFacet, ClearingTransferFacet, and ClearingReadFacet into a new dedicated facet. Breaking: IClearingActions, IClearingRedeem, IClearingTransfer, and IClearingRead interfaceIds all change.
- 6e12e4c: # ClearingFacet absorbs `initializeClearing`

  Move `initializeClearing` out of the standalone `ClearingActionsFacet` into the consolidated `ClearingFacet`, completing the clearing module unification started in `refactor: consolidate Clearing facets into a single ClearingFacet`. `ClearingFacet` now exposes 6 selectors under `_CLEARING_RESOLVER_KEY`: `initializeClearing`, `activateClearing`, `deactivateClearing`, `isClearingActivated`, `getClearedAmountFor`, `getClearingThirdParty`.

  ## Changes
  - `IClearing.sol` / `Clearing.sol` / `ClearingFacet.sol`: added `initializeClearing(bool)` (gated by `onlyNotClearingInitialized`); selector count goes from 5 to 6.
  - Deleted `contracts/facets/layer_1/clearing/ClearingActionsFacet.sol`, `ClearingActions.sol`, `IClearingActions.sol` and `test/testTimeTravel/facetsTimeTravel/clearingActions/ClearingActionsFacetTimeTravel.sol`.
  - Removed `_CLEARING_ACTIONS_RESOLVER_KEY` from `resolverKeys.sol`.
  - `Factory.sol`: `_tryInitializeClearing` now calls `IClearing.initializeClearing` instead of `IClearingActions.initializeClearing`.
  - `IAsset.sol`: dropped `IClearingActions` from imports and the inheritance list (`IClearing` already exposes the selector).
  - Updated `Configuration.ts`, `orchestratorLibraries.ts` and the 7 `createConfiguration.ts` scripts (bond, bondFixedRate, bondKpiLinkedRate, bondSustainabilityPerformanceTargetRate, equity, loan, loanPortfolio) to drop `ClearingActionsFacet`.
  - Refreshed `atsRegistry.data.ts` (regenerated): `initializeClearing` and `AlreadyInitialized` now belong to `ClearingFacet`; total facets: 97 → 96.
  - Updated `test/fixtures/tokens/loan.fixture.ts` and `loansPortfolio.fixture.ts` to wire `initializeClearing` through `ClearingFacet__factory`.

  ## Breaking
  - `IClearingActions` interface is removed. The `interfaceId` for the clearing initializer surface now lives on `IClearing` and changes accordingly.
  - `ClearingActionsFacet` no longer exists as a deployable facet; the resolver key `_CLEARING_ACTIONS_RESOLVER_KEY` is gone. Diamond configurations that referenced it must register `ClearingFacet` instead.

  ## Non-breaking

  The 4-byte selector of `initializeClearing(bool)` (`0x86a0b46a`) is unchanged, so direct low-level calls through the diamond proxy continue to work without modification.

- f075993: Migrate `Coupon` writer + 3 rate variants (`CouponFixedRateFacet`,
  `CouponKpiLinkedRateFacet`, `CouponSustainabilityPerformanceTargetRateFacet`) from
  `contracts/facets/layer_2/coupon/` to the canonical flat `contracts/facets/coupon/`. The
  shared `CouponFacetBase` scaffold is preserved at the new flat location because four concrete
  facets share the same 6-selector set + virtual `_prepareCoupon` hook. Resolver keys, selector
  sets, ABI, and runtime behaviour are unchanged. Removes the 4 dead `Coupon*FacetTimeTravel`
  mirrors. Aligns Coupon with the post-MAF-split layout established by Dividend (PR #1038).
- 7c6d97e: Migrate `DividendFacet` from `contracts/facets/layer_2/dividend/` to the canonical flat
  location `contracts/facets/dividend/` and collapse the legacy 3-tier scaffold (`Dividend` →
  `DividendFacetBase` → `DividendFacet`) into the modern 2-tier shape (`Dividend` abstract +
  `DividendFacet` concrete) used by every post-split MAF facet. Resolver key
  (`_DIVIDEND_RESOLVER_KEY`), selector set, ABI, and runtime behaviour are unchanged. Removes
  the dead `DividendFacetTimeTravel` mirror. Aligns Dividend with the post-MAF-split layout
  established by BBND-1605.
- 7ee4ec9: Refactor `operatorClearingCreateHoldByPartition` from `ClearingHoldCreation` contract into a new `OperatorClearingHoldByPartition` facet, registered under `_OPERATOR_CLEARING_HOLDBYPARTITION_RESOLVER_KEY`.
- ba0aaaf: refactor(KpiLinkedRate): rename facet externals to disambiguate from `SustainabilityPerformanceTargetRate` (BBND-1731). The four `get`/`set` methods get a `KpiLinkedRate` prefix and the initialiser is camel-cased:
  - `getImpactData` → `getKpiLinkedRateImpactData`
  - `getInterestRate` → `getKpiLinkedRateInterestRate`
  - `setImpactData` → `setKpiLinkedRateImpactData`
  - `setInterestRate` → `setKpiLinkedRateInterestRate`
  - `initialize_KpiLinkedRate` → `initializeKpiLinkedRate`

  Events (`InterestRateUpdated`, `ImpactDataUpdated`) and shared structs (`InterestRate`, `ImpactData` on `IKpiLinkedRateErrors`) are unchanged. Selectors change because the canonical signatures change — external integrators calling the old method names on a `KpiLinkedRate`-bearing diamond must migrate to the prefixed names. SDK adapter call-sites (`RPCQueryAdapter`, `RPCTransactionAdapter`) are updated to bridge the rename internally; the SDK port-in API is unchanged.

  `IKpiLinkedRate` is now inherited by `IAsset`. The historical exclusion existed because `IKpiLinkedRate` and `ISustainabilityPerformanceTargetRate` collided on four selectors; with the rename above, the collision is gone and KPI-linked rate joins the umbrella. `ISustainabilityPerformanceTargetRate` remains excluded pending its own rename ticket. Consumers (integration tests, SDK RPC adapters) now type the diamond handle as `IAsset` instead of the facet interface.

  `KpiLinkedRateFacet` adopts the `Bytes4Builder.build(...)` helpers introduced by `a75de2c9` for both `getStaticFunctionSelectors` and `getStaticInterfaceIds`, replacing the descending `--selectorIndex` boilerplate. Output is byte-identical.

  Also fixes a latent bug in `tasks/compile.ts` `erc3643-clone-interfaces`: the regen was dropping the `is IKpiLinkedRateErrors` hierarchy from the T-REX shadow on every ABI-changing regen, leaving `InterestRate`/`ImpactData` out of scope. `IKpiLinkedRate` is now declared with `removeImports: false, removeHierarchy: false` and a companion `IKpiLinkedRateErrors` shadow is cloned.

- 681d5d9: Extract `getTokenHoldersAtSnapshot` and `getTotalTokenHoldersAtSnapshot` from `SnapshotsFacet` into a new `SecurityHoldersAtSnapshotFacet`, registered under `_SECURITY_HOLDERS_AT_SNAPSHOT_RESOLVER_KEY`.
- f2979e5: Refactor ERC20 allowance SC methods (`allowance`, `approve`, `increaseAllowance`, `decreaseAllowance`) into a new `AllowanceFacet`. The `Approval` event and the `InsufficientAllowance`, `SpenderWithZeroAddress`, `ZeroOwnerAddress` errors are relocated to `IAllowanceTypes`.
- 308289b: Split a new Burn Facet. ERC3643OperationsFacet is empty so is deleted
- f2979e5: Refactor canTransfer and canTransferFrom functions from ERC1594 contract, setCompliance function from ERC3643Management contract and compliance function from ERC3643Read contract into a new compliance facet.
- 2924ef0: Refactor `controllerCreateHoldByPartition` function from `HoldManagement` contract into a new `controllerHoldByPartition` facet.
- f2979e5: Refactor core SC decimalsAt method into a new coreAdjusted facet
- f2979e5: Refactor core SC methods into a new core facet
- 560678c: Refactor `getDividendHolders` and `getTotalDividendHolders` out of `DividendFacet` into a new
  `DividendSecurityHoldersFacet` (resolver key `_DIVIDEND_SECURITY_HOLDERS_RESOLVER_KEY`),
  aggregated into `IAsset` via the new `IDividendSecurityHolders` interface. Introduces shared
  `IDividendTypes` (structs only) for the dividend domain.
- 3d9ace1: Extract `lockedBalanceOfAtSnapshotByPartition` from `SnapshotsFacet` into a new
  `LockAtSnapshotByPartitionFacet` registered under `_LOCK_AT_SNAPSHOT_BY_PARTITION_RESOLVER_KEY`.
  All token configurations include the new facet. `ISnapshots` no longer declares
  `lockedBalanceOfAtSnapshotByPartition`; `IAsset` now inherits `ILockAtSnapshotByPartition`.
- 194defd: Refactor issueByPartition function from ERC1410Issuer contract into a new MintByPartition facet.
- b288300: MAF split: extract OperatorClearingByPartitionFacet with operatorClearingRedeemByPartition (from ClearingRedeemFacet) and operatorClearingTransferByPartition (from ClearingTransferFacet)
- 9883669: MAF split: extract OperatorFacet with isOperator (from ERC1410ReadFacet) and authorizeOperator/revokeOperator (from ERC1410TokenHolderFacet)
- 727033e: Extract `protectedRedeemFromByPartition` and `protectedTransferFromByPartition` from `ERC1410Management` into a new `ProtectedByPartitionFacet` (BBND-1629). Pure capability split — no behaviour change. The new facet is wired into all seven asset archetypes that already include `ERC1410ManagementFacet`. Resolver key `_PROTECTED_BY_PARTITION_RESOLVER_KEY` derived deterministically from `keccak256("security.token.standard.protectedByPartition.resolverKey")`.
- fd6d7b4: Extract `protectedClearingRedeemByPartition` (from `ClearingRedeem`) and `protectedClearingTransferByPartition` (from `ClearingTransfer`) into a new `ProtectedClearingByPartitionFacet` (BBND-1630). Pure capability split — no behaviour change. The new facet is wired into all seven asset archetypes that include both source clearing facets. Resolver key `_PROTECTED_CLEARING_BY_PARTITION_RESOLVER_KEY` derived deterministically from `keccak256("security.token.standard.protectedClearingByPartition.resolverKey")`.
- f2372c5: Extract `protectedClearingCreateHoldByPartition` from `ClearingHoldCreation` into a new `ProtectedClearingHoldByPartitionFacet` (BBND-1631). The source `ClearingHoldCreation` MAF is fully drained as part of this split: its facet/interface/abstract files are deleted, its resolver key (`_CLEARING_HOLDCREATION_RESOLVER_KEY`) is removed, the orphaned TimeTravel mirror is deleted, and all consumers (`IAsset`, seven `createConfiguration.ts` files, `orchestratorLibraries.ts`, two doc-comments in `clearingHoldByPartition/`) are repointed to the new facet. Resolver key `_PROTECTED_CLEARING_HOLD_BY_PARTITION_RESOLVER_KEY` derived deterministically from `keccak256("security.token.standard.protectedClearingHoldByPartition.resolverKey")`.
- 7013af0: Refactor `protectedCreateHoldByPartition` out of `HoldManagementFacet` into a new
  `ProtectedHoldByPartitionFacet` (resolver key `_PROTECTED_HOLD_BY_PARTITION_RESOLVER_KEY`),
  aggregated into `IAsset` via the new `IProtectedHoldByPartition` interface.
- caaca51: Split recovery capability out of ERC3643Management and ERC3643Read into a new RecoveryFacet. Moves `recoveryAddress` from ERC3643ManagementFacet and `isAddressRecovered` from ERC3643ReadFacet (drained) into the new flat `contracts/facets/recovery/` folder.
- abee626: Extract scheduled balance adjustment selectors from `AdjustBalances` into a new `ScheduledBalanceAdjustment` facet, leaving `AdjustBalances` with only the immediate `adjustBalances` and `triggerAndSyncAll` paths.
- 3bbe0f3: Refactor getSecurityHolders and getTotalSecurityHolders from Security contract into a new SecurityHolders facet.
- 8a474b3: MAF split: extract `partitionsOfAtSnapshot` from `SnapshotsFacet` into a new `SnapshotsByPartitionFacet`.
- 59c2f61: Refactor transfer and transferFrom functions from ERC20 contract, and transferWithData and transferFromWithData functions from ERC1594 contract into a new transfer facet.
- a737023: MAF split: extract `transferByPartition` from `ERC1410TokenHolderFacet` into a new `TransferByPartitionFacet`, draining the source facet.
- e14641c: audit issue FIND-098, kpi rate calculation updated
- 144620e: Refactor isIssuable and issue functions from ERC1594 contract and mint function from ERC3643Operations contract into a new mint facet.
- 8e232b0: Refactor addAgent and removeAgent functions from ERC3643Management contract, controllerRedeem, controllerTransfer and finalizeControllable functions from ERC1644 contract, forcedTransfer function from ERC3643Operations contract, isAgent function from ERC3643Read contract and isControllable function from ERC1644 contract into a new controller facet.
- 3a00654: BLR bugs fixed. `getVersionStatus` and `getLatestVersion` method signatures updated; new batched `getLatestVersions(bytes32[])` view added so deploy scripts can avoid the JSON-RPC relay per-IP `eth_call` rate limit.
- 20ead46: ownership added to blr
- 21ba6f8: createConfiguraiton and createBatchConfiguration methods in the BLR and deployProxy in the Factory now include a data input argument that is simply emitted in the event
- 26c2584: Remove SustainabilityPerformanceTargetRate facet, its interfaces, storage wrappers, resolver keys, scripts, fixtures, and tests from the codebase.
- 4bbadce: Rename `MetadataFacet` to `CustomDataFacet` across the entire contracts package.

  **Renamed facet stack**
  `IMetadata`, `Metadata`, and `MetadataFacet` are replaced by `ICustomData`, `CustomData`, and `CustomDataFacet` respectively, located under `contracts/facets/customData/`. `MetadataStorageWrapper` is renamed to `CustomDataStorageWrapper` under `contracts/domain/core/`.

  **Breaking: ABI changes**
  `setMetadata(bytes32,bytes[])` → `setCustomData(bytes32,bytes[])` and `getMetadata(bytes32)` → `getCustomData(bytes32)`. Any on-chain or off-chain caller must update to the new selectors.

  **Breaking: role hash change**
  `ROLE_METADATA_MANAGER` (`0x4f7e...6733`) is replaced by `ROLE_CUSTOM_DATA_MANAGER` (`0x0b34...01b0`). Any access-control grant issued under the old hash is no longer recognised by the facet. Re-grant under the new role after upgrading.

  **Breaking: resolver key and storage slot change**
  `RESOLVER_KEY_METADATA` → `RESOLVER_KEY_CUSTOM_DATA` (`0xfe75...a56`). `STORAGE_LOCATION_METADATA` → `STORAGE_LOCATION_CUSTOM_DATA` (`0x92ac...700`). Diamond configurations must register the facet under the new resolver key; existing storage is unreachable under the old slot.

- 9320b3b: Merge `getScheduledSnapshots` and `scheduledSnapshotCount` from the deprecated `ScheduledSnapshotsFacet` into `SnapshotsFacet` and remove the standalone facet.
- cc7e1fe: Normalise every ERC-7201 storage struct to the canonical 5-region banner layout and remove dead per-struct `initialized` fields (now owned by the centralised initializer).

  Breaking: reordering the business-logic resolver's `initialized` flag and dropping the dead flags on NominalValue, KpiLinkedRate and InterestRateType shift in-namespace field offsets — existing deployments must be redeployed, not upgraded in place.

- 6701c1f: refactor(contracts): harden Initializer guards, remove stale modifier and utility contracts, and close branch coverage gaps (BBND-1827).

  Production code changes:
  - `Initializer.initializeInitializer` and `Initializer.updateMaxInitializerFacetIndex` now revert
    with `ZeroValueNotAllowed` when called with `_maxInitializerFacetIndex == 0`; the `notZeroValue`
    modifier is applied at the function signature level.
  - `Initializer.setOperationalStatus` now requires `DEFAULT_ADMIN_ROLE`; previously it had no access
    control gate, allowing any caller to trigger the operational-status transition.
  - `BondModifiers.sol` and `EquityModifiers.sol` removed; all modifier logic they contained is now
    applied directly in the facets or is no longer needed after the centralised initialiser system.
  - `ContextProvider.sol` and `LocalContext.sol` removed; the EVM-accessor wrappers they provided
    (`_msgSender`, `_blockTimestamp`, etc.) are now accessed directly from the `EvmAccessors` library
    and `TimeTravelStorageWrapper`; no concrete facet inherits these abstract contracts.

  Test and mock changes:
  - `upgradeMockFacet1AnyVersion()` added to `IMockFacet1` interface and `MockFacet1` contract; calls
    `onlyFacetRegistered` with an empty `_fromLastVersions` array, exercising the `if (length == 0) return`
    early-exit branch in `InitializerStorageWrapper.checkFacetRegistered`.
  - `untested_initializers.test.ts` deleted; all 10 initialiser methods it covered have complete
    three-case tests (AccountHasNoRole, happy path, FacetAlreadyRegistered) in their respective
    facet test files, making the file pure duplication.
  - `ProtectedPartitionRoleValidator.sol` (`infrastructure/utils/`) deleted and replaced by
    `ProtectedPartitionRoleValidatorModifiers.sol` (`services/asset/`); the contract is renamed
    and the three modifiers (`onlyProtectedPartitionRole`, `onlyWildCardOrPartitionRole`,
    `onlySelfOrPartitionRole`) are backed by private `_check*` helpers instead of inline logic.
  - `ProtectedPartitionRoleRequired` error relocated from the abstract contract to
    `IProtectedByPartition`, where it semantically belongs.
  - `AssetModifiers` inherits `ProtectedPartitionRoleValidatorModifiers`, making all modifiers
    available to every facet that extends `AssetModifiers` without a direct dependency.
  - `Burn` no longer directly inherits `ProtectedPartitionRoleValidator`.

  Factory refactor:
  - `BondFixedRateData`, `BondKpiLinkedRateData` structs removed from `IFactory`; moved to a new
    `IMockFactory` interface that lives exclusively in the test mock layer.
  - `deployBondFixedRate` and `deployBondKpiLinkedRate` functions removed from `Factory` and
    `IFactory`; `MockFactory` now implements `IMockFactory` alongside `Factory` and provides these
    functions for test contexts only.
  - `BondFixedRateDeployed` and `BondKpiLinkedRateDeployed` events removed from `IFactory`; declared
    in `IMockFactory`.
  - `onlyValidInterestRate` and `onlyValidImpactData` modifiers and their corresponding private
    validators (`_checkInterestRate`, `_checkImpactData`) removed from `Factory`.
  - `SecurityData` struct booleans moved to the end of the struct to improve ABI packing.
  - `SecurityType.Equity` reordered before `BondVariableRate` in the enum.
  - Deploy scripts and integration tests updated to reference `IMockFactory` types.

  TypeScript type fixes:
  - `controllerHoldByPartition` test: `holdIdentifier` typed inline; `hold.amount`, `hold.escrow`,
    `hold.data`, `hold.to` cast to match `checkCreatedHold_expected` parameter types.
  - `mintByPartition` test: removed `operatorData` field absent from `IssueDataStruct`.
  - `deploy-full-suite.fixture.ts`: `aliceIdentity` and `bobIdentity` cast to `any` for
    `addKey`/`addClaim` calls on OnchainID contracts that lack generated typechain types.
  - `DeployFactoryResult`: added optional `implementationAddress` field referenced in tests.
  - `deploymentFiles` test mock: added missing `getDepositTokenFacets` method.

  Breaking changes: `setOperationalStatus` now reverts for any caller without `DEFAULT_ADMIN_ROLE`.
  `ContextProvider` and `LocalContext` are removed from the contract surface; any external project
  that inherited these abstract contracts must migrate to direct library calls.
  `ProtectedPartitionRoleValidator` is removed; replace with `ProtectedPartitionRoleValidatorModifiers`
  at `services/asset/ProtectedPartitionRoleValidatorModifiers.sol`. `ProtectedPartitionRoleRequired`
  is now declared on `IProtectedByPartition`, not on the validator contract.
  `IFactory.BondFixedRateData`, `IFactory.BondKpiLinkedRateData`, `IFactory.deployBondFixedRate`,
  `IFactory.deployBondKpiLinkedRate`, `IFactory.BondFixedRateDeployed` and
  `IFactory.BondKpiLinkedRateDeployed` removed from the production interface; use `IMockFactory`
  equivalents in test and script contexts.

- 3f20512: Extract `getVotingHolders` and `getTotalVotingHolders` from `VotingFacet` into a new dedicated `VotingSecurityHoldersFacet`.

  **New `VotingSecurityHoldersFacet` — holder-enumeration queries for voting corporate actions**
  Introduces `IVotingSecurityHolders`, `VotingSecurityHolders` (abstract), and `VotingSecurityHoldersFacet`, registered under the new `_VOTING_SECURITY_HOLDERS_RESOLVER_KEY`. The facet exposes 2 selectors: `getVotingHolders(uint256,uint256,uint256)` (`0x009f64ac`) and `getTotalVotingHolders(uint256)` (`0x92c51818`). Both functions delegate directly to `VotingStorageWrapper` with no additional modifier, matching the behaviour previously in `VotingFacet`.

  **Breaking: `VotingFacet` selector count reduced from 7 to 5**
  `getVotingHolders` and `getTotalVotingHolders` are removed from `IVoting`, `Voting`, and `VotingFacet`. Any diamond configuration that includes `VotingFacet` must also register `VotingSecurityHoldersFacet` to preserve the full voting surface. The equity token configuration (`EQUITY_FACETS`) is updated accordingly.

  **Registry and configuration updated**
  `atsRegistry.data.ts` registers `VotingSecurityHoldersFacet` with its selectors, errors, and factory. `TOTAL_FACETS` bumped from 120 to 121. `IAsset` exposes the new `IVotingSecurityHolders` interface.

  **Integration tests**
  `votingSecurityHolders.test.ts` covers: holders resolved from snapshot after record date, live holders when no snapshot was taken, empty/zero return before record date, and pagination correctness.

### Minor Changes

- 8b4258b: Add `nominalValueCurrency` (ISO 4217 `bytes3`) to the `NominalValue` facet. Extends `initializeNominalValue` to accept the currency and adds `setNominalValueCurrency` / `getNominalValueCurrency` external functions, plus the matching SDK command, query, request DTOs, and adapter wiring. Factory forwards `bondDetails.currency` / `equityDetails.currency` on new deploys. Renames `initialize_NominalValue` to `initializeNominalValue` (camelCase, drops the solhint disable). [BBND-1730]
- cf4d8bf: Remove the `version == 0` "use latest" sentinel from `DiamondCutManager` and the
  `ResolverProxy` initialisation path.
  - `DiamondCutManager` resolution helpers (`resolveResolverProxyCall`,
    `resolveSupportsInterface`, `checkResolverProxyConfigurationRegistered`) and
    every paginated read helper now revert with the new
    `VersionZero(configurationId)` error when supplied with `_version == 0`,
    enforced by a `validateConfigurationVersion` modifier on the external entry
    points.
  - The non-reverting predicate `isResolverProxyConfigurationRegistered` keeps its
    lenient semantics: it returns `false` for `_version == 0` rather than
    reverting.
  - `ResolverProxy` deployments with `version = 0` revert through the same path
    during `_initialize`.
  - Off-chain callers that want the most recent registered version must read it
    explicitly via `DiamondCutManager.getLatestVersionByConfiguration` and pass
    the resolved number.
  - `scripts/infrastructure`: the `LATEST_VERSION` constant has been removed.
    `deployResolverProxy(options)` now requires `options.version: number` and
    rejects values below 1 with a clear runtime error.

  Migration: any deployment pipeline or integration that was relying on
  `version: 0` to track the latest configuration must read the latest version
  first and pin the resolved value. The auto-updating proxy pattern is gone.
  External integrators catching reverts on `(configId, version)` lookups
  should add a branch for the new `VersionZero(configId)` error in addition
  to the existing `ResolverProxyConfigurationNoRegistered`.

- beab0e9: Add DepositToken as a new asset type.

  A deposit token is a minimal cash-style tokenised claim (no yield, coupon, maturity
  or interest rate).
  - New `DEPOSIT_TOKEN_CONFIG_ID` configuration registered in the BusinessLogicResolver,
    with a deposit-token-specific facet list (`createDepositTokenConfiguration`).
  - New `DepositToken` value in `IFactory.SecurityType` and `DepositTokenData` struct.
  - New `Factory.deployDepositToken(DepositTokenData, FactoryRegulationData)` entry point
    (registered in `FactoryFacet`/`MockFactoryFacet` static selectors) plus a dedicated
    `_deployDepositTokenSecurity` that initialises only the deposit-token facets, so the
    asset deliberately excludes Compliance, KYC, External KYC, External Pause, Protected
    Partitions, Identity & Claims, Snapshots, Lock and the other capabilities marked FALSE.
  - New `deployDepositTokenFromFactory` TypeScript wrapper and deploy-workflow wiring.

- 84c0c22: Migrate 94 facets to Bytes4Builder pattern, eliminating manual bytes4[] array construction

  Extended `Bytes4Builder` library with overloads 7–12 (stack-safe without `viaIR`, capped at
  12 parameters). Migrated 94 `*Facet.sol` contracts from repetitive manual `bytes4[]`
  construction to `Bytes4Builder.build(...)`, reducing boilerplate and improving consistency.

  Two facets remain with the manual pattern due to Solidity stack limits without `viaIR`:
  `LoansPortfolioFacet` (20 selectors) and `AmortizationFacetBase` (15 selectors).

- aabf9de: audit issue find 004 fixed
- ae981c5: Fix ERC-20 Transfer event compliance and centralise balance mutation logic.

  **Missing Transfer event on partition-based operations (`ERC1410StorageWrapper`)**
  EIP-20 requires a `Transfer` event for every balance change. `ERC1410StorageWrapper` was emitting `TransferByPartition` without the mandatory ERC-20 `Transfer`, breaking off-chain indexer traceability. Adds the missing emit and regression tests for `batchBurn`, `batchMint`, `batchTransfer`, `batchForcedTransfer`, `batchFreeze`, and `batchUnfreeze`.

  **Duplicate Transfer emissions removed from mint/burn facets**
  `BatchBurn`, `Burn`, `BatchMint`, and `Mint` were re-emitting `Transfer` after `TokenCoreOps` had already fired it internally, producing duplicate logs on every operation. Removes the redundant `emit` calls and the now-unused `ITransfer` imports from all four facets.

  **Duplicate Transfer emissions removed from `ERC20StorageWrapper`**
  After `ERC1410StorageWrapper` became the single emitter for partition paths, the two `emit ITransfer.Transfer` calls inside `ERC20StorageWrapper.transfer` and `ERC20StorageWrapper.transferFrom` became redundant and were removed.

  **Centralised balance mutation via `ERC20StorageWrapper.performTransfer`**
  Introduces `performTransfer(from, to, amount)` as the single internal function responsible for both balance accounting and `Transfer` event emission. Extracts `_reducePartitionOnly`, `_increasePartitionOnly`, and `_addPartitionToOnly` from `ERC1410StorageWrapper` so callers can mutate partition state without touching ERC-20 storage. All call sites in `ERC1410StorageWrapper`, `ERC3643StorageWrapper`, `ClearingOps`, `HoldStorageWrapper`, `LockStorageWrapper`, and `TokenCoreOps` are updated to route through `performTransfer`.

  **Dead code removed — direct consequence of `performTransfer` centralisation**
  `TokenCoreOps` exposed three public passthroughs (`reduceBalanceByPartition`, `increaseBalanceByPartition`, `addPartitionTo`) that were labelled "for ClearingOps" but had zero callers after the centralisation. The corresponding `internal` wrappers in `ERC1410StorageWrapper` (`reduceBalanceByPartition`, `increaseBalanceByPartition`, `addPartitionTo`) and `ERC3643StorageWrapper.transferFrozenBalance` — which called `increaseBalance` directly, bypassing `performTransfer` and therefore emitting no `Transfer` event — were also removed.

  **Least-privilege visibility (`internal` → `private`)**
  `ERC3643StorageWrapper._transferFrozenBalanceOnly` and `ERC1410StorageWrapper.deletePartitionForHolder` are only ever called within their own file. Both are now `private`, following the least-privilege rule and matching the project's existing naming convention for private helpers.

  **`msg.sender` replaced with `EvmAccessors.getMsgSender()` across production facets**
  Five direct uses of `msg.sender` in `Burn.sol` (`redeem`, `redeemFrom`), `Transfer.sol` (`transferFromWithData`), and `Compliance.sol` (`canTransfer`) bypassed the EVM accessor wrapper layer. All five are replaced with `EvmAccessors.getMsgSender()`. `Compliance.sol` also receives the missing `EvmAccessors` import.

  **Regression tests**
  Covers `burnByPartition`, `mintByPartition`, `clearingByPartition`, `lockByPartition`, `transferAndLock`, `operatorClearingHoldByPartition`, `protectedHoldByPartition`, `transferWithData`, `transferFromWithData`, and all batch variants — asserting exactly one `Transfer` event per operation.

- 94bbc49: Add facets' version to deployment output file, a flag to deploy only a Bond Configuration and a flag to deploy in parallel Facets in networks as Besu (not compatible with Hedera)
- 2968ef6: Introduce FactoryFacet with enhanced factory capabilities for the asset tokenization system.

  **Changes:**
  - Added `FactoryFacet.sol` with new factory operations
  - Updated `DiamondCutManager` and related interfaces for improved compatibility
  - New resolver keys in `resolverKeys.sol`
  - Refactored deployment workflows (`deploySystemWithNewBlr.ts`, `deploySystemWithExistingBlr.ts`) for better modularity
  - New `createConfiguration.ts` for factory configuration setup
  - Extended `atsRegistry.data.ts` with factory configuration data
  - Comprehensive test coverage for factory deployment and configuration validation
  - Enhanced test fixtures and diamond cut manager integration tests

- 9879296: Feat FIND-033: add force-cancel capability for all corporate action types.

  Introduces a new `CORPORATE_ACTION_CANCEL_ADMIN_ROLE` and five corresponding force-cancel methods — `forceCancelCoupon`, `forceCancelDividend`, `forceCancelVoting`, `forceCancelBalanceAdjustment`, and `forceCancelAmortization` — that allow privileged admins to cancel a corporate action regardless of its execution or record date. This unblocks stuck actions (e.g. already-executed) without bypassing active-hold guards for amortization.

  Each method keeps the same modifier chain as its regular cancel counterpart, only replacing the role constant and removing the internal date guard. Events `CouponForceCancelled`, `DividendForceCancelled`, `VotingForceCancelled`, `ScheduledBalanceAdjustmentForceCancelled`, and `AmortizationForceCancelled` are emitted at the facet layer.

- c1b3835: Add InterestRateFacet with coupon rate type selector (STANDARD, FIXED, KPI_LINKED).
  - Introduces `IInterestRate` interface with `setCouponRateType`, `getCouponRateType`, and `initializeInterestRateType`
  - Moves `RateType` enum from `ICouponTypes` to `IInterestRate` as the canonical owner
  - Adds `InterestRateStorageWrapper` helpers: `setCouponRateType`, `getCouponRateType`, `requireValidRateType`
  - Adds `CouponRateDispatchLib` as central dispatcher for coupon rate resolution across all rate variants
  - Wires `InterestRateFacet` into Factory deployment for all security types (Equity, Bond, BondFixedRate, BondKpiLinkedRate)
  - Adds `InterestRateModifiers` with `onlyValidRateType` delegating to storage wrapper

- 78b262b: check max supply bug fixed
- 233ab1e: Audit FIND-059: Add `updateLockExpirationByPartition` and `updateLockExpiration` to allow
  `ROLE_LOCKER` accounts to correct a lock's expiration timestamp.

  Previously `lockByPartition` (and `lock`) imposed no upper bound on `_expirationTimestamp`,
  so a locker could set it to `type(uint256).max`, creating a lock that could never be released
  through any existing path. A second locker can now correct the date in two transactions;
  if the original locker is compromised, an admin can revoke its role first.

  Changes:
  - `ILockTypes` — new `LockExpirationUpdated` event carrying `operator`, `tokenHolder`,
    `partition`, `lockId`, `oldExpirationTimestamp`, and `newExpirationTimestamp`.
  - `LockStorageWrapper` — new internal `updateLockExpiration` that mutates only the
    `expirationTimestamp` field of the stored `LockData` record; amount aggregates and
    ABAF/LABAF values are left untouched.
  - `ILockByPartition` / `LockByPartition` / `LockByPartitionFacet` — new external
    `updateLockExpirationByPartition(partition, tokenHolder, lockId, newExpirationTimestamp)`
    gated by `onlyRole(ROLE_LOCKER)`, `onlyWithValidLockId`, and
    `onlyValidExpirationTimestamp`.
  - `ILock` / `Lock` / `LockFacet` — new external `updateLockExpiration(tokenHolder, lockId,
newExpirationTimestamp)` as the default-partition convenience counterpart, additionally
    gated by `onlyWithoutMultiPartition`.

  Both new selectors are ABI additions and do not change existing function signatures.

- a4b1f13: unchecked block updated
- fa68d5d: audit issue FIND-105 foxed. getCouponRaw method implement to return the coupon without interest rate calculation nor snapshot id
- 74568b2: audit issue find 146 fixed
- 378912b: New HashSphere network for smart contracts deployments. Can use parallel facets deployment.
- e78bb17: trigger scheduled task added to some initializers and code refactor
- 7f1f5da: dead event removed
- a34b1fa: Add tests in allowance, approve, decreaseAllowance, increaseAllowance functions increase coverage.
- 0dfb7ba: Add LoansPortfolioFacet for LoanPortfolio asset type. Manages a portfolio of loan and cash holdings with classification by collateral, performance status, and country. Includes LoansPortfolioStorageWrapper, full Diamond integration (resolver keys, roles, storage positions), TimeTravel test variant, and a complete integration test suite.
- 0a44a06: removed freeze by partition and unfreeze by partition internal methods
- 947d70f: # BalanceTrackerAdjustedFacet split

  Extract `balanceOfAt` from `ERC1410ReadFacet` into a dedicated `BalanceTrackerAdjustedFacet` registered under `_BALANCE_TRACKER_ADJUSTED_RESOLVER_KEY`.

  ## Changes
  - Added `contracts/facets/balanceTrackerAdjusted/IBalanceTrackerAdjusted.sol`, `BalanceTrackerAdjusted.sol`, `BalanceTrackerAdjustedFacet.sol`.
  - Added `_BALANCE_TRACKER_ADJUSTED_RESOLVER_KEY` constant in `resolverKeys.sol`.
  - Removed `balanceOfAt` from `ERC1410Read.sol`, `IERC1410Read.sol`, and `ERC1410ReadFacet.sol`; selector count drops from 9 to 8. Also migrated `ERC1410ReadFacet` selector registration to the `--selectorIndex`/`unchecked` pattern.
  - `IAsset` now exposes `balanceOfAt` via `IBalanceTrackerAdjusted`.
  - Updated `Configuration.ts`, `orchestratorLibraries.ts` and all 7 `createConfiguration.ts` scripts to include `BalanceTrackerAdjustedFacet`.
  - Added `test/contracts/integration/balanceTrackerAdjusted/balanceTrackerAdjusted.test.ts` covering: balance at current time, zero balance, timestamp 0, single scheduled adjustment before/after, and multiple chained adjustments.

  ## Non-breaking

  The 4-byte selector of `balanceOfAt` is unchanged. Any call to `asset.balanceOfAt(...)` through `IAsset` continues to work without modification.

- f6dcd85: # BalanceTrackerAtSnapshotByPartitionFacet split

  Extract `balanceOfAtSnapshotByPartition` and `totalSupplyAtSnapshotByPartition` from `SnapshotsFacet` into a dedicated `BalanceTrackerAtSnapshotByPartitionFacet` registered under `_BALANCE_TRACKER_AT_SNAPSHOT_BY_PARTITION_RESOLVER_KEY`.

  ## Changes
  - Added `contracts/facets/balanceTrackerAtSnapshotByPartition/IBalanceTrackerAtSnapshotByPartition.sol`, `BalanceTrackerAtSnapshotByPartition.sol`, `BalanceTrackerAtSnapshotByPartitionFacet.sol`.
  - Added `_BALANCE_TRACKER_AT_SNAPSHOT_BY_PARTITION_RESOLVER_KEY` constant in `resolverKeys.sol`.
  - Removed `balanceOfAtSnapshotByPartition` and `totalSupplyAtSnapshotByPartition` from `Snapshots.sol`, `ISnapshots.sol` and `SnapshotsFacet.sol`; selector count drops from 15 to 13.
  - `IAsset` now exposes the two selectors via `IBalanceTrackerAtSnapshotByPartition`.
  - Updated `Configuration.ts`, `orchestratorLibraries.ts` and all 7 `createConfiguration.ts` scripts to include `BalanceTrackerAtSnapshotByPartitionFacet`.
  - Added `test/contracts/integration/balanceTrackerAtSnapshotByPartition/balanceTrackerAtSnapshotByPartition.test.ts` covering: balance/total-supply at a snapshot for a partition, snapshotted vs. post-snapshot mutations, partition isolation, and `SnapshotIdNull` / `SnapshotIdDoesNotExists` revert paths.

  ## Non-breaking

  The 4-byte selectors of `balanceOfAtSnapshotByPartition` and `totalSupplyAtSnapshotByPartition` are unchanged. Calls through `IAsset` continue to work without modification.

- 317b632: # BalanceTrackerAtSnapshotFacet split

  Extract `balanceOfAtSnapshot`, `balancesOfAtSnapshot` and `totalSupplyAtSnapshot` from `SnapshotsFacet` into a dedicated `BalanceTrackerAtSnapshotFacet` registered under `_BALANCE_TRACKER_AT_SNAPSHOT_RESOLVER_KEY`.

  ## Changes
  - Added `contracts/facets/balanceTrackerAtSnapshot/IBalanceTrackerAtSnapshot.sol`, `BalanceTrackerAtSnapshot.sol`, `BalanceTrackerAtSnapshotFacet.sol`.
  - Added `_BALANCE_TRACKER_AT_SNAPSHOT_RESOLVER_KEY` constant in `resolverKeys.sol`.
  - Removed `balanceOfAtSnapshot`, `balancesOfAtSnapshot` and `totalSupplyAtSnapshot` from `Snapshots.sol`, `ISnapshots.sol` and `SnapshotsFacet.sol`; selector count drops from 18 to 15. Also migrated `SnapshotsFacet` selector registration to the `--selectorIndex`/`unchecked` pattern.
  - `IAsset` now exposes the three selectors via `IBalanceTrackerAtSnapshot`.
  - Updated `Configuration.ts`, `orchestratorLibraries.ts` and all 7 `createConfiguration.ts` scripts to include `BalanceTrackerAtSnapshotFacet`.
  - Added `test/contracts/integration/balanceTrackerAtSnapshot/balanceTrackerAtSnapshot.test.ts` covering: balance/total-supply at a snapshot, snapshotted vs. post-snapshot mutations, paginated `balancesOfAtSnapshot`, and `SnapshotIdNull` / `SnapshotIdDoesNotExists` revert paths.

  ## Non-breaking

  The 4-byte selectors of `balanceOfAtSnapshot`, `balancesOfAtSnapshot` and `totalSupplyAtSnapshot` are unchanged. Calls through `IAsset` continue to work without modification.

- e998857: - Add `BatchBurnFacet` with `batchBurn` method, splitting batch burn logic into a dedicated facet registered under `_BATCH_BURN_RESOLVER_KEY`.
  - Remove `batchBurn` from `ERC3643BatchFacet` (which retains `batchTransfer`, `batchForcedTransfer`, and `batchMint`).
  - Remove `batchBurn` from `IERC3643Batch` interface.
- e998857: - Add `BatchMintFacet` with `batchMint`, registering the selector under the new `_BATCH_MINT_RESOLVER_KEY` (`keccak256("security.token.standard.batchmint.resolverKey")`).
  - Move `batchMint` logic from `ERC3643Batch` into new `BatchMint` abstract contract and `IBatchMint` interface under `facets/batchMint/`.
  - Remove `batchMint` from `ERC3643Batch`, `IERC3643Batch`, and `ERC3643BatchFacet` (which now exposes 3 selectors: `batchTransfer`, `batchForcedTransfer`, `batchBurn`).
  - Clean up imports in `ERC3643Batch.sol` (`_ISSUER_ROLE`, `TimeTravelStorageWrapper`, `CapStorageWrapper` removed as they were only used by `batchMint`).
- e998857: - Add `BatchTransferFacet` with `batchTransfer` method, splitting batch transfer logic into a dedicated facet registered under `_BATCH_TRANSFER_RESOLVER_KEY`.
  - Remove `batchTransfer` from `ERC3643BatchFacet` (which retains `batchForcedTransfer` and `batchMint`).
  - Remove `batchTransfer` from `IERC3643Batch` interface.
- bbac906: # CapByPartitionFacet split

  Extract `setMaxSupplyByPartition` and `getMaxSupplyByPartition` from `CapFacet` into a dedicated `CapByPartitionFacet` registered under `_CAP_BY_PARTITION_RESOLVER_KEY`.

  ## Changes
  - Added `contracts/facets/capByPartition/ICapByPartition.sol`, `CapByPartition.sol`, `CapByPartitionFacet.sol`.
  - Added `_CAP_BY_PARTITION_RESOLVER_KEY` constant in `resolverKeys.sol`.
  - Removed `setMaxSupplyByPartition` and `getMaxSupplyByPartition` from `Cap.sol`, `ICap.sol` and `CapFacet.sol`; selector count drops from 5 to 3. Partition-related events (`MaxSupplyByPartitionSet`) and errors (`MaxSupplyReachedForPartition`, `NewMaxSupplyForPartitionTooLow`, `NewMaxSupplyByPartitionTooHigh`) remain on `ICap` because they are still raised by mint/burn paths via `CapStorageWrapper`.
  - `IAsset` now exposes the two selectors via `ICapByPartition`.
  - Updated `Configuration.ts` and all 8 `createConfiguration.ts` scripts to include `CapByPartitionFacet`.
  - Lifted the dedicated partition-cap test cases from `test/contracts/integration/layer_1/cap/cap.test.ts` into a new `test/contracts/integration/capByPartition/capByPartition.test.ts`. The cross-cutting `Adjust balances` cases (which exercise both global and partition-scoped caps together) stay in `cap.test.ts`.

  ## Non-breaking

  The 4-byte selectors of `setMaxSupplyByPartition` and `getMaxSupplyByPartition` are unchanged. Calls through `IAsset` continue to work without modification.

- 2bcbc97: # ClearingAtSnapshotByPartitionFacet split

  Extract `clearedBalanceOfAtSnapshotByPartition` from `SnapshotsFacet` into a dedicated `ClearingAtSnapshotByPartitionFacet` registered under `_CLEARING_AT_SNAPSHOT_BY_PARTITION_RESOLVER_KEY`.

  ## Changes
  - Added `contracts/facets/clearingAtSnapshotByPartition/IClearingAtSnapshotByPartition.sol`, `ClearingAtSnapshotByPartition.sol`, `ClearingAtSnapshotByPartitionFacet.sol`.
  - Added `_CLEARING_AT_SNAPSHOT_BY_PARTITION_RESOLVER_KEY` constant in `resolverKeys.sol`.
  - Removed `clearedBalanceOfAtSnapshotByPartition` from `Snapshots.sol`, `ISnapshots.sol` and `SnapshotsFacet.sol`; selector count drops from 15 to 14. The global `clearedBalanceOfAtSnapshot` stays in `Snapshots`.
  - `IAsset` now exposes the selector via `IClearingAtSnapshotByPartition`.
  - Updated `Configuration.ts`, `orchestratorLibraries.ts` (registered with `clearingReadOps`) and all 7 `createConfiguration.ts` scripts to include `ClearingAtSnapshotByPartitionFacet`.
  - Lifted the dedicated cleared-balance scenario from `test/contracts/integration/layer_1/snapshots/snapshots.test.ts` into a new `test/contracts/integration/clearingAtSnapshotByPartition/clearingAtSnapshotByPartition.test.ts`. The test still co-asserts on the global `clearedBalanceOfAtSnapshot`, which keeps working through `IAsset` because that function remains in `SnapshotsFacet`.

  ## Non-breaking

  The 4-byte selector of `clearedBalanceOfAtSnapshotByPartition` is unchanged. Calls through `IAsset` continue to work without modification.

- 5ff68af: # ClearingAtSnapshotFacet split

  Extract `clearedBalanceOfAtSnapshot` from `SnapshotsFacet` into a dedicated `ClearingAtSnapshotFacet` registered under `_CLEARING_AT_SNAPSHOT_RESOLVER_KEY`.

  ## Changes
  - Added `contracts/facets/clearingAtSnapshot/IClearingAtSnapshot.sol`, `ClearingAtSnapshot.sol`, `ClearingAtSnapshotFacet.sol`.
  - Added `_CLEARING_AT_SNAPSHOT_RESOLVER_KEY` constant in `resolverKeys.sol`.
  - Removed `clearedBalanceOfAtSnapshot` from `Snapshots.sol`, `ISnapshots.sol` and `SnapshotsFacet.sol`; selector count drops from 15 to 14. The partition-scoped `clearedBalanceOfAtSnapshotByPartition` stays in `Snapshots` and will be split separately.
  - `IAsset` now exposes the selector via `IClearingAtSnapshot`.
  - Updated `Configuration.ts`, `orchestratorLibraries.ts` (registered with `clearingReadOps`) and all 7 `createConfiguration.ts` scripts to include `ClearingAtSnapshotFacet`.
  - Lifted the dedicated cleared-balance test case from `test/contracts/integration/layer_1/snapshots/snapshots.test.ts` into a new `test/contracts/integration/clearingAtSnapshot/clearingAtSnapshot.test.ts`.

  ## Non-breaking

  The 4-byte selector of `clearedBalanceOfAtSnapshot` is unchanged. Calls through `IAsset` continue to work without modification.

- cc0c979: # ClearingHoldByPartitionFacet split

  Extract `clearingCreateHoldByPartition`, `clearingCreateHoldFromByPartition`, and `getClearingCreateHoldForByPartition` from `ClearingHoldCreationFacet` into a dedicated `ClearingHoldByPartitionFacet` registered under `_CLEARING_HOLDBYPARTITION_RESOLVER_KEY`.

  ## Changes
  - Added `contracts/facets/clearingHoldByPartition/IClearingHoldByPartition.sol`, `ClearingHoldByPartition.sol`, `ClearingHoldByPartitionFacet.sol`.
  - Added `_CLEARING_HOLDBYPARTITION_RESOLVER_KEY` constant in `resolverKeys.sol`.
  - `ClearingHoldCreationFacet` now exposes only `protectedClearingCreateHoldByPartition` (1 selector, library links reduced to `clearingProtectedOps` only).
  - `IClearingHoldCreation` no longer declares the three moved functions; they are now in `IClearingHoldByPartition`.
  - `IAsset` extended with `IClearingHoldByPartition`.
  - Updated `Configuration.ts`, `orchestratorLibraries.ts`, and `createConfiguration.ts` to register `ClearingHoldByPartitionFacet`.
  - Added `test/contracts/integration/clearingHoldByPartition/clearingHoldByPartition.test.ts` with full modifier coverage.

  ## Non-breaking

  The 4-byte selectors of the three moved functions are unchanged. Any call to `asset.clearingCreateHoldByPartition(...)`, `asset.clearingCreateHoldFromByPartition(...)`, or `asset.getClearingCreateHoldForByPartition(...)` through `IAsset` continues to work without modification.

- 8ee00e5: # ComplianceByPartitionFacet split

  Extract `canTransferByPartition` and `canRedeemByPartition` from `ERC1410ReadFacet` into a dedicated `ComplianceByPartitionFacet` registered under `_COMPLIANCE_BY_PARTITION_RESOLVER_KEY`.

  ## Changes
  - Added `contracts/facets/complianceByPartition/IComplianceByPartition.sol`, `ComplianceByPartition.sol`, `ComplianceByPartitionFacet.sol`.
  - Added `_COMPLIANCE_BY_PARTITION_RESOLVER_KEY` constant in `resolverKeys.sol`.
  - Removed `canTransferByPartition` and `canRedeemByPartition` from `ERC1410Read.sol`, `ERC1410ReadFacet.sol`, and `IERC1410Read.sol` (6 → 4 selectors).
  - `IAsset` now also inherits `IComplianceByPartition`.
  - Updated `Configuration.ts` and all 7 `createConfiguration.ts` scripts (bond, bondFixedRate, bondKpiLinkedRate, bondSustainabilityPerformanceTargetRate, equity, loan, loanPortfolio) to register `ComplianceByPartitionFacet` alongside `ComplianceFacet`.

  ## Non-breaking

  The 4-byte selectors of both functions are unchanged (`0xa7b518b1` for `canTransferByPartition`, `0x7b7322c4` for `canRedeemByPartition`). Any call to `asset.canTransferByPartition(...)` or `asset.canRedeemByPartition(...)` through `IAsset` continues to work without modification.

- 32e1453: # ControllerByPartitionFacet split

  Extract `controllerTransferByPartition` and `controllerRedeemByPartition` from `ERC1410ManagementFacet`
  into a dedicated `ControllerByPartitionFacet` registered under `_CONTROLLER_BY_PARTITION_RESOLVER_KEY`.

  ## Changes
  - Added `contracts/facets/controllerByPartition/IControllerByPartition.sol`, `ControllerByPartition.sol`,
    `ControllerByPartitionFacet.sol`.
  - Added `_CONTROLLER_BY_PARTITION_RESOLVER_KEY` constant in `resolverKeys.sol`.
  - `ERC1410ManagementFacet` reduced from 7 to 5 selectors; stale imports (`CONTROLLER_ROLE`, `AGENT_ROLE`,
    `AccessControlStorageWrapper`) removed from `ERC1410Management.sol`.
  - `IAsset` now exposes the two controller-by-partition functions via `IControllerByPartition`.
  - Updated `Configuration.ts`, `orchestratorLibraries.ts` and all 7 `createConfiguration.ts` scripts to
    include `ControllerByPartitionFacet`.
  - Added `test/contracts/integration/controllerByPartition/controllerByPartition.test.ts` with full
    modifier coverage (paused, wrong partition, non-controllable, access control) and success cases for
    both `CONTROLLER_ROLE` and `AGENT_ROLE`.

  ## Non-breaking

  The 4-byte selectors of `controllerTransferByPartition` and `controllerRedeemByPartition` are unchanged.
  Any call to these functions through `IAsset` continues to work without modification.

- 79c0eb1: refactor: add CoreAtSnapshotFacet for snapshot-based core token property queries
- e97d1df: # CouponListingFacet split

  Extract coupon and scheduled-coupon listing queries from `CouponFacet` and `ScheduledCouponListingFacet` into a dedicated `CouponListingFacet` registered under `_COUPON_LISTING_RESOLVER_KEY`.

  ## Changes
  - Added `contracts/facets/layer_2/coupon/couponListing/ICouponListing.sol`, `CouponListing.sol`, `CouponListingFacet.sol`.
  - Added `_COUPON_LISTING_RESOLVER_KEY` constant in `resolverKeys.sol`.
  - Removed `getCouponFromOrderedListAt`, `getCouponsOrderedList`, `getCouponsOrderedListTotal` from `Coupon.sol`, `ICoupon.sol`, and `CouponFacetBase.sol` (12 → 9 selectors).
  - Deleted `ScheduledCouponListingFacet.sol`, `ScheduledCouponListing.sol`, `IScheduledCouponListing.sol` and the `ScheduledCouponListingFacetTimeTravel.sol` shim (all emptied by the split).
  - `IAsset` now inherits `ICouponListing` instead of `IScheduledCouponListing`.
  - Updated `Configuration.ts`, all 5 `createConfiguration.ts` scripts (bond, bondFixedRate, bondKpiLinkedRate, bondSustainabilityPerformanceTargetRate, loanPortfolio) to reference `CouponListingFacet`. Added `CouponListingFacet` to `loan/createConfiguration.ts`.
  - Added `test/contracts/integration/layer_1/coupon/couponListing/couponListing.test.ts` consolidating ordered-list and scheduled-listing tests.

  ## Non-breaking

  The 4-byte selectors of all five functions are unchanged. Any call to `asset.getCouponsOrderedList(...)`, `asset.getCouponFromOrderedListAt(...)`, `asset.getCouponsOrderedListTotal()`, `asset.scheduledCouponListingCount()`, or `asset.getScheduledCouponListing(...)` through `IAsset` continues to work without modification.

- 9722c83: # CouponSecurityHoldersFacet split

  Extract coupon security-holder queries from `CouponFacet` into a dedicated `CouponSecurityHoldersFacet` registered under `_COUPON_SECURITY_HOLDERS_RESOLVER_KEY`.

  ## Changes
  - Added `contracts/facets/couponSecurityHolders/ICouponSecurityHolders.sol`, `CouponSecurityHolders.sol`, `CouponSecurityHoldersFacet.sol`.
  - Added `_COUPON_SECURITY_HOLDERS_RESOLVER_KEY` constant in `resolverKeys.sol`.
  - Removed `getCouponHolders`, `getCouponsFor`, `getTotalCouponHolders` from `Coupon.sol`, `ICoupon.sol`, and `CouponFacetBase.sol` (9 → 6 selectors).
  - `IAsset` now inherits `ICouponSecurityHolders` alongside `ICoupon`.
  - Updated `Configuration.ts` and 5 `createConfiguration.ts` scripts (bond, bondFixedRate, bondKpiLinkedRate, bondSustainabilityPerformanceTargetRate, loan) to register `CouponSecurityHoldersFacet`.
  - Added `test/contracts/integration/couponSecurityHolders/couponSecurityHolders.test.ts` covering snapshot holders, pre-record-date empty results, pagination, and error cases.

  ## Non-breaking

  The 4-byte selectors of all three functions are unchanged. Any call to `asset.getCouponHolders(...)`, `asset.getCouponsFor(...)`, or `asset.getTotalCouponHolders(...)` through `IAsset` continues to work without modification.

- e96952b: # EIP712Facet split

  Extract `DOMAIN_SEPARATOR` from `ERC20PermitFacet` into a dedicated `EIP712Facet`
  registered under `_EIP712_RESOLVER_KEY`.

  ## Changes
  - Added `contracts/facets/eip712/IEIP712.sol`, `EIP712.sol`, `EIP712Facet.sol`.
  - Added `_EIP712_RESOLVER_KEY` to `resolverKeys.sol`.
  - Removed `DOMAIN_SEPARATOR` from `IERC20Permit.sol`, `ERC20Permit.sol`; updated
    `ERC20PermitFacet.sol` to 1 selector with pre-decrement pattern.
  - `IAsset` now inherits `IEIP712`.
  - Updated `Configuration.ts` and 7 `createConfiguration.ts` scripts to register `EIP712Facet`.
  - Added `test/contracts/integration/eip712/eip712.test.ts`.

  ## Non-breaking

  The 4-byte selector of `DOMAIN_SEPARATOR` is unchanged. Any call through `IAsset`
  continues to work without modification.

- 2c3f9ab: # FreezeAtSnapshotByPartitionFacet split

  Extract `frozenBalanceOfAtSnapshotByPartition` from `SnapshotsFacet` into a dedicated `FreezeAtSnapshotByPartitionFacet` registered under `_FREEZE_AT_SNAPSHOT_BY_PARTITION_RESOLVER_KEY`.

  ## Changes
  - Added `contracts/facets/freezeAtSnapshotByPartition/IFreezeAtSnapshotByPartition.sol`, `FreezeAtSnapshotByPartition.sol`, `FreezeAtSnapshotByPartitionFacet.sol`.
  - Added `_FREEZE_AT_SNAPSHOT_BY_PARTITION_RESOLVER_KEY` constant in `resolverKeys.sol`.
  - Removed `frozenBalanceOfAtSnapshotByPartition` from `Snapshots.sol`, `SnapshotsFacet.sol`, and `ISnapshots.sol` (11 → 10 selectors).
  - `IAsset` now also inherits `IFreezeAtSnapshotByPartition`.
  - Updated `Configuration.ts` and all 7 `createConfiguration.ts` scripts (bond, bondFixedRate, bondKpiLinkedRate, bondSustainabilityPerformanceTargetRate, equity, loan, loanPortfolio) to register `FreezeAtSnapshotByPartitionFacet` alongside `SnapshotsFacet`.

  ## Non-breaking

  The 4-byte selector of `frozenBalanceOfAtSnapshotByPartition` is unchanged (`0x0749c323`). Any call to `asset.frozenBalanceOfAtSnapshotByPartition(...)` through `IAsset` continues to work without modification.

- 3b9e2f6: # FreezeAtSnapshotFacet split

  Extract `frozenBalanceOfAtSnapshot` from `SnapshotsFacet` into a dedicated `FreezeAtSnapshotFacet` registered under `_FREEZE_AT_SNAPSHOT_RESOLVER_KEY`.

  ## Changes
  - Added `contracts/facets/freezeAtSnapshot/IFreezeAtSnapshot.sol`, `FreezeAtSnapshot.sol`, `FreezeAtSnapshotFacet.sol`.
  - Added `_FREEZE_AT_SNAPSHOT_RESOLVER_KEY` constant in `resolverKeys.sol`.
  - Removed `frozenBalanceOfAtSnapshot` from `Snapshots.sol`, `SnapshotsFacet.sol`, and `ISnapshots.sol` (12 → 11 selectors). `frozenBalanceOfAtSnapshotByPartition` stays in `SnapshotsFacet`.
  - `IAsset` now also inherits `IFreezeAtSnapshot`.
  - Updated `Configuration.ts` and all 7 `createConfiguration.ts` scripts (bond, bondFixedRate, bondKpiLinkedRate, bondSustainabilityPerformanceTargetRate, equity, loan, loanPortfolio) to register `FreezeAtSnapshotFacet` alongside `SnapshotsFacet`.

  ## Non-breaking

  The 4-byte selector of `frozenBalanceOfAtSnapshot` is unchanged (`0x5e6c70ec`). Any call to `asset.frozenBalanceOfAtSnapshot(...)` through `IAsset` continues to work without modification.

- ba14b9c: # HoldAtSnapshot split

  Extract `heldBalanceOfAtSnapshot` from `SnapshotsFacet` into a dedicated
  `HoldAtSnapshotFacet` registered under `_HOLD_AT_SNAPSHOT_RESOLVER_KEY`.

  ## Changes
  - Added `contracts/facets/holdAtSnapshot/IHoldAtSnapshot.sol`,
    `HoldAtSnapshot.sol`, `HoldAtSnapshotFacet.sol`.
  - Added `_HOLD_AT_SNAPSHOT_RESOLVER_KEY` constant in `resolverKeys.sol`.
  - Removed `heldBalanceOfAtSnapshot` from `ISnapshots.sol`, `Snapshots.sol`,
    and `SnapshotsFacet.sol` (11 → 10 selectors).
  - `IAsset` now inherits `IHoldAtSnapshot`.
  - Updated `Configuration.ts` and 7 `createConfiguration.ts` scripts
    (equity, bond, bondFixedRate, bondKpiLinkedRate,
    bondSustainabilityPerformanceTargetRate, loan, loanPortfolio) to register
    `HoldAtSnapshotFacet`.
  - Added `test/contracts/integration/holdAtSnapshot/holdAtSnapshot.test.ts`
    covering revert cases (SnapshotIdNull, SnapshotIdDoesNotExists), happy paths,
    historical correctness across two snapshots, and multi-holder independence.
  - Removed `heldBalanceOfAtSnapshot` assertions from `snapshots.test.ts`.

  ## Non-breaking

  The 4-byte selector of `heldBalanceOfAtSnapshot` is unchanged. Any call
  through `IAsset` continues to work without modification.

- 2aef6e3: # IdentityFacet split

  Extract `setIdentityRegistry`, `setOnchainID`, `identityRegistry`, and `onchainID` from
  `ERC3643ManagementFacet` and `ERC3643ReadFacet` into a dedicated `IdentityFacet` registered
  under `_IDENTITY_RESOLVER_KEY`.

  ## Changes
  - Added `contracts/facets/identity/IIdentity.sol`, `Identity.sol`, `IdentityFacet.sol`.
  - Added `_IDENTITY_RESOLVER_KEY` constant in `resolverKeys.sol`.
  - Removed `setIdentityRegistry`, `setOnchainID` from `IERC3643Management.sol`,
    `ERC3643Management.sol`, and `ERC3643ManagementFacet.sol` (4 → 2 selectors).
  - Removed `identityRegistry`, `onchainID` from `IERC3643Read.sol`, `ERC3643Read.sol`, and
    `ERC3643ReadFacet.sol` (3 → 1 selectors).
  - `IAsset` now also inherits `IIdentity`.
  - Updated `Configuration.ts` and all 7 `createConfiguration.ts` scripts (bond, bondFixedRate,
    bondKpiLinkedRate, bondSustainabilityPerformanceTargetRate, equity, loan, loanPortfolio) to
    register `IdentityFacet` alongside the ERC3643 facets.

  ## Non-breaking

  The 4-byte selectors of `setIdentityRegistry` (`0xcbf3f861`), `setOnchainID` (`0x3d1ddc5b`),
  `identityRegistry` (`0x134e18f4`), and `onchainID` (`0xaba63705`) are unchanged. Calls through
  `IAsset` continue to work without modification.

- b065203: # LockAtSnapshot split

  Extract `lockedBalanceOfAtSnapshot` from `SnapshotsFacet` into a dedicated
  `LockAtSnapshotFacet` registered under `_LOCK_AT_SNAPSHOT_RESOLVER_KEY`.

  ## Changes
  - Added `contracts/facets/lockAtSnapshot/ILockAtSnapshot.sol`,
    `LockAtSnapshot.sol`, `LockAtSnapshotFacet.sol`.
  - Added `_LOCK_AT_SNAPSHOT_RESOLVER_KEY` constant in `resolverKeys.sol`.
  - Removed `lockedBalanceOfAtSnapshot` from `Snapshots.sol`, `ISnapshots.sol`,
    and `SnapshotsFacet.sol` (10 → 9 selectors).
  - `IAsset` now inherits `ILockAtSnapshot`.
  - Updated `Configuration.ts` and 7 `createConfiguration.ts` scripts
    (equity, bond, bondFixedRate, bondKpiLinkedRate, bondSPTR, loan,
    loanPortfolio) to register `LockAtSnapshotFacet`.
  - Added `test/contracts/integration/lockAtSnapshot/lockAtSnapshot.test.ts`
    covering null snapshot, unknown snapshot, zero-lock, exact-amount,
    historical isolation, and multi-holder scenarios.

  ## Non-breaking

  The 4-byte selector of `lockedBalanceOfAtSnapshot` is unchanged. Any call
  through `IAsset` continues to work without modification.

- 362dbfc: # LockByPartitionFacet split

  Extract the partition-aware lock surface — `lockByPartition`, `releaseByPartition`,
  `getLockedAmountForByPartition`, `getLockCountForByPartition`, `getLocksIdForByPartition`,
  `getLockForByPartition` — from `LockFacet` into a dedicated `LockByPartitionFacet` registered
  under `_LOCK_BY_PARTITION_RESOLVER_KEY`.

  ## Changes
  - Added `contracts/facets/lockByPartition/ILockByPartition.sol`, `LockByPartition.sol`,
    `LockByPartitionFacet.sol`.
  - Introduced `contracts/facets/layer_1/lock/ILockTypes.sol` for the Lock domain events
    and errors shared across both facets — `LockedByPartition`, `LockByPartitionReleased`,
    `LockExpirationNotReached`, `WrongLockId`. Both `ILock` and `ILockByPartition` inherit
    from it. The `LockData` struct stays in `ILock` because it is the I/O of a single
    external method (`getLockByPartition` on `LockFacet`).
  - Removed `lockByPartition`, `releaseByPartition`, `getLockedAmountForByPartition`,
    `getLockCountForByPartition`, `getLocksIdForByPartition`, `getLockForByPartition` from
    `Lock.sol`, `LockFacet.sol`, and `ILock.sol` (14 → 8 selectors).
  - Added `_LOCK_BY_PARTITION_RESOLVER_KEY` constant in `resolverKeys.sol`.
  - Updated `LockStorageWrapper.sol` to revert with `ILockTypes.WrongLockId` and
    `ILockTypes.LockExpirationNotReached`. Storage continues to use `ILock.LockData`.
  - `IAsset` now also inherits `ILockByPartition`.
  - Updated `Configuration.ts` and all 7 `createConfiguration.ts` scripts (bond, bondFixedRate,
    bondKpiLinkedRate, bondSustainabilityPerformanceTargetRate, equity, loan, loanPortfolio) to
    register `LockByPartitionFacet` alongside `LockFacet`.
  - Moved partition-specific tests to `test/contracts/integration/lockByPartition/lockByPartition.test.ts`,
    including modifier-driven reverts (`TokenIsPaused`, `AccountHasNoRole`,
    `PartitionNotAllowedInSinglePartitionMode`).

  ## Non-breaking

  The 4-byte selectors of all moved methods are unchanged (`lockByPartition` `0x7a87884e`,
  `releaseByPartition` `0xdc6a3e75`, `getLockedAmountForByPartition` `0x6e1c55ba`,
  `getLockCountForByPartition` `0x3b193d92`, `getLocksIdForByPartition` `0x3ea8b59d`,
  `getLockForByPartition` `0xa9acfccb`). Any call to these methods through `IAsset` continues
  to work without modification.

- 328831d: # Maturity split

  Extract `fullRedeemAtMaturity` and `updateMaturityDate` from `BondFacet` into a dedicated
  `MaturityFacet` registered under `_MATURITY_RESOLVER_KEY`.

  ## Changes
  - Added `contracts/facets/maturity/IMaturity.sol`, `Maturity.sol`, `MaturityFacet.sol`.
  - Added `_MATURITY_RESOLVER_KEY` constant in `resolverKeys.sol`.
  - Removed `fullRedeemAtMaturity` and `updateMaturityDate` from `Bond.sol` and
    `IBondManagement.sol`; `Bond.sol` retains `redeemAtMaturityByPartition` (1 selector).
  - `IAsset` now inherits `IMaturity`.
  - Updated `scripts/domain/bond/createConfiguration.ts` and the three rate-variant bond
    `createConfiguration.ts` scripts to register `MaturityFacet`.
  - Updated `BondUSAFacetBase.sol`: removed maturity selectors (4 → 2 selectors).
  - Added `test/contracts/integration/maturity/maturity.test.ts` covering
    `fullRedeemAtMaturity` (8 negative + 2 happy-path + 1 edge) and
    `updateMaturityDate` (3 negative + 1 happy-path).
  - Moved `fullRedeemAtMaturity` tests from `bond.test.ts` to `maturity.test.ts`.
  - Moved `updateMaturityDate` tests from `coupon.test.ts` to `maturity.test.ts`.

  ## Non-breaking

  The 4-byte selectors of all functions are unchanged. Any call through `IAsset` continues to
  work without modification.

- aca5672: # OperatorByPartition split

  Extract per-partition operator functions from `ERC1410TokenHolder`, `ERC1410Read`, and
  `ERC1410Management` into a dedicated `OperatorByPartitionFacet` registered under
  `_OPERATOR_BY_PARTITION_RESOLVER_KEY`.

  ## Changes
  - Added `contracts/facets/operatorByPartition/IOperatorByPartition.sol`,
    `OperatorByPartition.sol`, `OperatorByPartitionFacet.sol`.
  - Added `_OPERATOR_BY_PARTITION_RESOLVER_KEY` constant in `resolverKeys.sol`.
  - Removed `authorizeOperatorByPartition` and `revokeOperatorByPartition` from
    `ERC1410TokenHolder.sol` and `IERC1410TokenHolder.sol` (3 → 1 selectors).
  - Removed `isOperatorForPartition` from `ERC1410Read.sol` and `IERC1410Read.sol`
    (3 → 2 selectors).
  - Removed `operatorTransferByPartition` and `operatorRedeemByPartition` from
    `ERC1410Management.sol` and `IERC1410Management.sol` (5 → 3 selectors).
  - `IERC1410` now inherits `IOperatorByPartition`.
  - Updated `Configuration.ts` and 7 `createConfiguration.ts` scripts to register
    `OperatorByPartitionFacet`.
  - Added `test/contracts/integration/operatorByPartition/operatorByPartition.test.ts`
    covering authorise, revoke, query, operator-transfer, and operator-redeem scenarios.

  ## Non-breaking

  The 4-byte selectors of all five functions are unchanged. Any call through `IAsset` or
  `IERC1410` continues to work without modification.

- d1b0667: # OperatorHoldByPartition split

  Extract `operatorCreateHoldByPartition` from `HoldManagementFacet` into a dedicated
  `OperatorHoldByPartitionFacet` registered under `_OPERATOR_HOLD_BY_PARTITION_RESOLVER_KEY`.

  ## Changes
  - Added `contracts/facets/operatorHoldByPartition/IOperatorHoldByPartition.sol`,
    `OperatorHoldByPartition.sol`, `OperatorHoldByPartitionFacet.sol`.
  - Added `_OPERATOR_HOLD_BY_PARTITION_RESOLVER_KEY` constant in `resolverKeys.sol`.
  - Deleted `IHoldManagement.sol`, `HoldManagement.sol`, `HoldManagementFacet.sol`
    (facet had 1 selector → 0 after split).
  - `IHold` no longer aggregates `IHoldManagement` (removed import).
  - `IAsset` now inherits `IOperatorHoldByPartition`.
  - Replaced `HoldManagementFacet` with `OperatorHoldByPartitionFacet` in `Configuration.ts`
    and 7 `createConfiguration.ts` scripts (equity, bond, bondFixedRate, bondKpiLinkedRate,
    bondSustainabilityPerformanceTargetRate, loan, loanPortfolio).
  - Updated `orchestratorLibraries.ts`: removed `HoldManagementFacet` library mapping,
    added `OperatorHoldByPartitionFacet: ["holdOps"]`.
  - Added `test/contracts/integration/operatorHoldByPartition/operatorHoldByPartition.test.ts`
    covering all modifiers, happy path, and edge cases.

  ## Non-breaking

  The 4-byte selector of `operatorCreateHoldByPartition` is unchanged. Any call through
  `IAsset` continues to work without modification.

- fc9b444: # PartitionsFacet split + ERC1410ReadFacet removal

  Extract `partitionsOf` and `isMultiPartition` into a dedicated `PartitionsFacet` registered
  under `_PARTITIONS_RESOLVER_KEY`, and complete the dismantling of `ERC1410ReadFacet` (whose
  remaining selectors had already been migrated by earlier facet splits — balance trackers,
  compliance-by-partition, operator, balance-tracker-adjusted).

  ## Changes
  - Added `contracts/facets/partitions/IPartitions.sol`, `Partitions.sol`, `PartitionsFacet.sol`.
  - Added `_PARTITIONS_RESOLVER_KEY` constant in `resolverKeys.sol`.
  - Removed `ERC1410ReadFacet.sol`, `ERC1410Read.sol`, `IERC1410Read.sol`, and the
    `ERC1410ReadFacetTimeTravel.sol` test variant.
  - Removed the `IERC1410` umbrella interface; the surviving callers (`Factory`, `IAsset`)
    now reference `IERC1410Management` directly, and `LoansPortfolioStorageWrapper` casts to
    `ITransferByPartition` for the single token-holder transfer it performs.
  - `IAsset` now inherits `IPartitions`, `IERC1410Management`, and `ITransferByPartition`
    (replacing the prior `IERC1410` umbrella).
  - Updated `Configuration.ts` and the 7 `createConfiguration.ts` scripts (bond, bondFixedRate,
    bondKpiLinkedRate, bondSustainabilityPerformanceTargetRate, equity, loan, loanPortfolio)
    to drop `ERC1410ReadFacet` and register `PartitionsFacet` alongside the remaining ERC1410
    facets.

  ## Non-breaking

  The 4-byte selectors of `partitionsOf` (`0x740ab8f4`) and `isMultiPartition` (`0xbd09cc54`)
  are unchanged — and so are every other selector previously routed through `ERC1410ReadFacet`,
  since they were each preserved by the earlier facet splits. Calls through `IAsset` continue
  to work without modification.

- 8ec1761: Consolidate 8 balance-adjustment functions from ScheduledBalanceAdjustmentsFacet, EquityUSAFacet, and ERC1410TokenHolderFacet into a single AdjustBalancesFacet at the flat contracts/facets/adjustBalances/ path.
- f2979e5: - Add `BalanceTrackerFacet` with `balanceOf` and `totalSupply` methods, consolidating balance-read logic into a dedicated facet with `_BALANCE_TRACKER_RESOLVER_KEY`.
  - Remove `balanceOf` and `totalSupply` from `ERC1410ReadFacet`.
  - SDK `RPCQueryAdapter` updated to call `balanceOf` and `totalSupply` via `IAsset`.
- f2979e5: - Add `DocumentationFacet` with `setDocument`, `removeDocument`, `getDocument` and `getAllDocuments`, registering document-management selectors under the new `_DOCUMENTATION_RESOLVER_KEY`.
  - Remove `ERC1643Facet`, `ERC1643`, `IERC1643`, `ERC1643FacetTimeTravel`, `_ERC1643_RESOLVER_KEY` and `_ERC1643_STORAGE_POSITION`.
  - `IAsset` updated to inherit `IDocumentation` instead of `IERC1643`; selectors and ABI are unchanged.
  - SDK adapters (`RPCQueryAdapter`, `RPCTransactionAdapter`, `SecurityMetadataOperations`) updated to connect via `IAsset__factory` instead of `ERC1643Facet__factory`.
- 63616b8: refactor(contracts): split HoldAtSnapshotByPartition facet out of Snapshots
- ea110d7: # TransferAndLockByPartitionFacet split

  Extract `transferAndLockByPartition` from `TransferAndLock` into a dedicated
  `TransferAndLockByPartitionFacet` registered under
  `_TRANSFER_AND_LOCK_BY_PARTITION_RESOLVER_KEY`.

  ## Changes
  - Added `contracts/facets/transferAndLockByPartition/ITransferAndLockTypes.sol`
    (shared `PartitionTransferredAndLocked` event).
  - Added `contracts/facets/transferAndLockByPartition/ITransferAndLockByPartition.sol`,
    `TransferAndLockByPartition.sol`, `TransferAndLockByPartitionFacet.sol`.
  - Added `_TRANSFER_AND_LOCK_BY_PARTITION_RESOLVER_KEY` constant in `resolverKeys.sol`.
  - Removed `transferAndLockByPartition` from `TransferAndLock.sol`,
    `ITransferAndLock.sol`, and `TransferAndLockFacetBase.sol` (2 → 1 selector).
  - `ITransferAndLock` now inherits `ITransferAndLockTypes` instead of declaring
    `PartitionTransferredAndLocked` directly.
  - `IAsset` now inherits `ITransferAndLockByPartition`.
  - Updated `Configuration.ts` and 6 `createConfiguration.ts` scripts
    (equity, bond, bondKpiLinkedRate, bondSPTR, loan, loanPortfolio)
    to register `TransferAndLockByPartitionFacet`.
  - Added
    `test/contracts/integration/transferAndLockByPartition/transferAndLockByPartition.test.ts`
    covering paused, access-control, expiration, invalid partition, and happy-path
    scenarios for both single-partition and multi-partition modes.

  ## Non-breaking

  The 4-byte selector of `transferAndLockByPartition` is unchanged. Any call
  through `IAsset` continues to work without modification.

- 612c62d: feat: Add MaturityByPartitionFacet for modular asset faceting (MAF)

  Introduces the MaturityByPartitionFacet as a standalone, reusable facet that handles maturity logic partitioned by asset state. This facet:
  - Replaces legacy maturity implementation with a partition-based approach
  - Provides maturity management independent of asset configuration
  - Supports both Equity and Bond token types
  - Integrates with BusinessLogicResolver for dynamic facet routing

  Part of the MAF (Modular Asset Facet) initiative to decompose monolithic asset contracts into smaller, independently upgradeable components.

- 49cb775: move facets (ssiManagement, nonces, externalPauseManagement, externalKycListManagement, externalControlListManagement, corporateActions, freeze, controlList, pause, accessControl, cap) from layer1 to facets folder
- 5f851ba: audit issue find-048 fixed, abaf and decimlas overflow checked when creating operation
- f76e0de: rename isPaused to paused fucntion in Pause Facet and rename Pause events and errors without Token word
- 70de716: temporary change removing admin check from blr create configuration methods
- 219207b: audit issue find-117fixed
- 96f0781: Remove the permissionless T-REX suite deployment surface from the factory and SDK.

  **Contracts:**
  - Removed `deployTREXSuiteAtsEquity` and `deployTREXSuiteAtsBond` from `TREXFactory`, along with the `TokenDetailsAts` struct and their associated imports.
  - Deleted the now-unreachable deployment libraries: `TREXEquityDeploymentLib`, `TREXBondDeploymentLib`, `core/TREXBaseDeploymentLib`, and `core/SecurityDeploymentLib`.
  - Updated `Configuration.ts` (empty `LIBRARY_NAMES`) and the deployment task so `TREXFactoryAts` is deployed without external libraries.
  - Removed the now write-only `atsFactory` storage, its `setAtsFactory` setter, and the constructor's `_atsFactory` argument, which only fed the deleted deployment libraries. The deployment task no longer derives or passes an ATS factory address.
  - The factory contract itself, its remaining setters, `recoverContractOwnership`, and `getToken` are preserved.

  **SDK:**
  - Removed the `createTrexSuite` feature end to end: bond/equity commands, handlers, requests, the `getTokenBySalt` query, the `TRexFactory` domain context, the `InvalidTrexTokenSalt` error, and `InjectableTrexFactory`.
  - Cleaned up the transaction/query adapters (HS and RPC), `TransactionAdapter`, `ValidationService` (`checkTrexTokenSaltExists`), `TransactionService`, the handlers registry, and the `TREX_CREATE_SUITE` gas constant.

- 2917e8e: Metadata facet added
- 29d7538: audit issue find 147 fixed. clearing hold creations transfer thrid party address to hold
- bede9bc: Add irreversible token deactivation via `DeactivateFacet`.

  **New `DeactivateFacet` — one-way retirement of a security token**
  Introduces a dedicated facet that permanently retires a token from active use. Once `deactivate()` is called by an account holding `DEACTIVATE_ROLE`, every operation guarded by `onlyActivated` reverts with `Deactivated`. The transition is intentionally one-way: there is no `reactivate` counterpart. The facet exposes two selectors: `deactivate()` and `isDeactivated()`.

  **New `DeactivateStorageWrapper` — diamond storage for the deactivation flag**
  Persists the deactivation state at a dedicated `_DEACTIVATE_STORAGE_POSITION` slot. Single-field struct (`bool deactivated`) designed for forward compatibility — future metadata (operator, timestamp, reason) can be appended without changing the slot. Provides `deactivate()`, `isDeactivated()`, and `requireActivated()` internals.

  **New `DeactivateModifiers` + `onlyActivated` wired into `CoreModifiers`**
  Adds the `onlyActivated` modifier as a reusable mix-in backed by `DeactivateStorageWrapper.requireActivated()`. `CoreModifiers` is updated to inherit `DeactivateModifiers`, making the guard available to all facets that already extend `CoreModifiers` without any further import changes.

  **New `DEACTIVATE_ROLE` constant and storage slot**
  `constants/roles.sol` and `constants/storagePositions.sol` receive the new `DEACTIVATE_ROLE` and `_DEACTIVATE_STORAGE_POSITION` entries. `IAsset.sol` is updated to expose the `IDeactivate` interface. The auto-generated `factory/ERC3643/interfaces/roles.sol` is regenerated accordingly.

  **Registry and configuration updated**
  `atsRegistry.data.ts` registers `DeactivateFacet` with its selectors. All existing `createConfiguration` scripts for bond, equity, and loan-portfolio token types are updated to include the new facet in the default diamond cut.

  **Integration tests**
  `deactivate.test.ts` covers: successful deactivation by role holder, revert on second call, revert when caller lacks `DEACTIVATE_ROLE`, revert on operations guarded by `onlyActivated` after deactivation, and `isDeactivated` read path.

- 52699b9: unused remove holds deleted
- 3f07cbe: new initializer facet created
- f7370ca: partition removal bug fixed. Labaf values updated
- b782fa9: couponFor token balance bug fixed

### Patch Changes

- f2455d2: Relocates IProceedRecipients, ProceedRecipients, ProceedRecipientsFacet, ProceedRecipientsKpiLinkedRateFacet from layer_2/proceedRecipient to facets/proceedRecipient. No ABI or logic changes. [BBND-1729]
- eca9fcd: Relocates ScheduledCrossOrderedTasks facets, IScheduledTasksCommon and ScheduledTasksLib out of layer_2/scheduledTask into top-level facets directories.
- 2da0e1d: Relocates ISnapshots, ISnapshotsTypes, Snapshots, SnapshotsFacet from layer_1/snapshot to facets/snapshot.
- e5440a1: Relocates IVoting, IVotingTypes, Voting, VotingFacet from layer_2/voting to facets/voting.
- deb0aae: Consolidate `getTotalBalanceForAdjustedAt` into `TokenCoreOps` as the single source of truth.

  `TokenCoreOps.getTotalBalanceForAdjustedAt` was missing the frozen balance component (balance + lock + hold + clearing, no frozen). `ERC3643StorageWrapper` had a correct wrapper that summed `TokenCoreOps` plus frozen, but this created an unnecessary indirection and two implementations to maintain.

  The fix adds the frozen balance term directly to `TokenCoreOps.getTotalBalanceForAdjustedAt` via `ERC3643StorageWrapper.getFrozenAmountForAdjustedAt`, removes the now-redundant wrapper in `ERC3643StorageWrapper` to call `TokenCoreOps` directly.

- 40fcb8a: Rename `KpisKpiLinkedRateFacet` to `KpisFacet`. [BBND-1764]
- 8e0007f: Move bond-specific facets out of `facets/layer_2/` into top-level `facets/` subdirectories. [BBND-1764]
  - `layer_2/amortization/` → `facets/amortization/` (`Amortization`, `AmortizationFacet`, `IAmortization`)
  - `layer_2/interestRate/fixedRate/` → `facets/fixedRate/` (`FixedRate`, `FixedRateFacet`, `IFixedRate`)
  - `layer_2/interestRate/kpiLinkedRate/` → `facets/kpiLinkedRate/` (`KpiLinkedRate`, `KpiLinkedRateFacet`, `IKpiLinkedRate`)
  - `layer_2/kpi/kpiLatest/` → `facets/kpi/` (`Kpis`, `KpisFacet`, `IKpis`)

- 413a3a9: Fix `TREXBaseDeploymentLib.deployTREXSuite` transferring ownership of pre-existing IR/TIR/CTR/MC/IRS to `_tokenDetails.owner`. Ownership is now transferred only for contracts newly deployed in the call, preventing a new token deployment from hijacking shared infrastructure already used by previously deployed tokens.
- ccd68f4: Add PR-gating lint and format CI workflows for ATS and MP, align workflow name prefixes with filenames, pin Node.js version via .nvmrc, and remove obsolete NODE_OPTIONS heap workarounds.
- d1a2507: Fix FIND-071: `removeTokenHolder` did not validate that the holder was registered before executing removal, causing silent state corruption and incorrect holder count when called for non-existent holders. Add `_checkUnexpectedError` guard on `tokenHolderIndex == 0` using new `KPI_ERC1410_REMOVE_HOLDER` error ID.
- dee49f6: Fix `_recoverSigner` not validating that `ecrecover` returned a non-zero address.

  `ecrecover` silently returns `address(0)` for invalid or malformed signatures instead of reverting. `_recoverSigner` was forwarding that result directly, which meant `_verify(address(0), …, invalidSig)` evaluated to `true` — allowing any malformed signature to pass verification when the expected signer happened to be `address(0)`.

  `_recoverSigner` now reverts with `ICommonErrors.WrongSignature()` when `ecrecover` returns `address(0)`.

- 825568b: Fix FIND-120: holder incorrectly removed from registry when burning or transferring all free tokens while encumbered tokens (locked/held/cleared/frozen) remain. Replace `_balanceOfAdjustedAt` with `_getTotalBalanceForAdjustedAt` in `ERC1410StorageWrapper.beforeTokenTransfer` for both burn and transfer paths. Update `deployOrchestratorLibraries` deployment order so `ClearingReadOps` is deployed before `TokenCoreOps`, which now depends on it transitively.
- da5532a: Fix: `batchMint` now validates the cumulative total against `maxSupply` instead of each amount individually.

  Previously, `requireWithinMaxSupply` was called once per recipient inside the validation loop. Because `_totalSupply` is not updated until the issuance pass, every individual check saw the same base supply and passed independently. An issuer could therefore submit a batch whose amounts were each below `maxSupply` but whose sum exceeded it, minting tokens beyond the cap.

  The fix accumulates all amounts in the validation loop and performs a single `requireWithinMaxSupply(totalAmount, ...)` call after the loop completes, before any tokens are issued.

- d41ffd0: Fix: `batchFreezePartialTokens` and `batchUnfreezePartialTokens` lacked the `onlyFreezeRoles` guard present on their single-holder equivalents, allowing any unprivileged caller to freeze or release arbitrary holders' transferable balances without `ROLE_FREEZE_MANAGER` or `ROLE_AGENT`.

  Add `onlyFreezeRoles(EvmAccessors.getMsgSender())` to both functions in `BatchFreeze.sol`, consistent with `batchSetAddressFrozen` in the same contract and with `freezePartialTokens` / `unfreezePartialTokens` in `Freeze.sol`.

- a838ad3: Fix: `batchTransfer` now validates sender and each destination against the control list and compliance module independently.

  Previously, `batchTransfer` used `onlyCompliant(sender, address(0), false)` for the sender and called `checkCompliance(address(0), to, false)` per destination, passing `address(0)` as the counterpart and `0` as the value in both cases. The sender was never validated as an individual account (only its compliance-contract approval was checked), and each per-destination compliance call omitted the actual sender and amount.

  The sender is now checked via `onlyAccountCompliant(sender)`, which validates recovery status and control-list membership before any token movement. Inside the loop, each destination is checked with `checkAccountCompliance(to)` (recovery + control list) followed by `checkTransferCompliance(sender, to, amounts[i])`, which calls the compliance module with the real sender address and transfer amount.

- c2cae93: Restore EIP-170 headroom for `ClearingOps` and the hold facet family. PRs #1089 and #1106 pushed `ClearingOps` (25.4 KiB) and `HoldByPartitionFacet` (24.8 KiB) over the 24 KiB runtime cap on 2026-05-13. `ClearingOps` is split into `ClearingOps` (creation + allowance + ABAF + cleared-event emitters) and a new `ClearingLifecycleOps` (approve / cancel / reclaim / dispatch / execution / balance-restoration). The four hold-facet abstracts (`HoldByPartition`, `OperatorHoldByPartition`, `ControllerHoldByPartition`, `ProtectedHoldByPartition`) are switched to call the existing `HoldOps` deployed orchestrator library via DELEGATECALL instead of inlining `HoldStorageWrapper` directly, matching the design intent documented in `HoldOps.sol`. No public ABI changes — every existing selector still resolves through the diamond. Both audit fixes from PRs #1089 and #1106 are preserved. Deployed sizes: ClearingOps 25.4 → 12.4 KiB, ClearingLifecycleOps 19.7 KiB (new); HoldByPartitionFacet 24.8 → 11.6 KiB; ProtectedHoldByPartitionFacet 12.0 → 2.9 KiB; ControllerHoldByPartitionFacet 10.1 → 2.5 KiB; OperatorHoldByPartitionFacet 10.6 → 3.0 KiB.
- 775f36e: Fix: `setCoupon` now rejects coupon `endDate` values that exceed the bond's maturity date.

  Previously, `setCoupon` validated internal date ordering (e.g. `startDate <= endDate`) via `onlyValidDates` modifiers but never compared `endDate` against `_getMaturityDate()`. A coupon with `endDate > maturityDate` could be created, causing interest to accrue beyond the bond's contractual life and producing incorrect coupon amounts.

  The fix adds `CouponStorageWrapper.checkEndDateAgainstMaturity`, which reads the bond's maturity date from storage and delegates to `DatesValidation.checkDates`, reverting with `WrongDates` if the constraint is violated. When `maturityDate` is zero the bond is treated as open-ended and no constraint is applied. `setCoupon` calls this check before any rate stamping.

- 7bdf045: Fix: `getPreviousCouponInOrderedList` now returns 0 when the coupon ID is not found in the ordered list.

  Previously, if `couponID` was absent from the ordered list (e.g. a cancelled coupon), the loop ran to completion and returned the last `previousCouponId` assigned — the second-to-last element in the list. Any subsequent rate calculation treating that unrelated coupon as the predecessor would produce an incorrect rate.

  The fix tracks whether the coupon was found during traversal and returns 0 if not, consistent with the "no previous coupon" sentinel used throughout `KpiLinkedRateLib` and `SustainabilityPerformanceTargetRateLib`.

- 1cacd76: fix hedera deployments and checkpoints inconsistences (nonce, features not registered,...)
- fb1e020: Add `checkExponentOverflow` guard to `DecimalsLib` and apply it in `BondStorageWrapper`, `DividendStorageWrapper` and `CouponStorageWrapper`.
  - Introduces `ICommonErrors.ExponentOverflow(uint256 exponent)` for cases where `10 ** exponent` would overflow `uint256` (exponent ≥ 78).
  - `DecimalsLib.checkExponentOverflow` replaces the previous `checkDecimalsOverflow`, fixing an off-by-one (`>` → `>=`) that silently allowed exponent 78 through to `pow10`.
  - `CouponStorageWrapper._calculateCouponAmount` widens `totalDecimals` from `uint8` to `uint256` before the guard, preventing silent wrap-around when `decimals + rateDecimals` exceeds 255.

- 5b8af28: Fix FIND-012: reject zero address in `BusinessLogicResolverWrapper._checkValidKeys`.

  Added an explicit `address(0)` check inside `_checkValidKeys` alongside the existing zero-key guard. Without it, passing `address(0)` as a business logic address was only caught implicitly later in `_registerBusinessLogics`, when the external call to `IStaticFunctionSelectors(address(0)).getStaticResolverKey()` caused an ABI-decode revert after potentially paying for earlier `SSTORE`s in the same batch.

  The new check reverts eagerly with `ZeroAddressNotValidForBusinessLogic` before any state mutation, keeping the validation `pure`, gas-efficient on the failure path, and consistent with the existing zero-key guard pattern.

- 8857703: Fix FIND-016: allow `removeExternalPause` to execute when the token is only externally paused.

  `removeExternalPause` was guarded by `onlyUnpaused`, which checks both the internal pause flag
  and every registered `IExternalPause` contract. If an external pause contract reported `true`
  permanently (e.g. due to a bug or compromise), the manager could never remove it — the guard
  itself blocked the only escape route, creating an irreversible deadlock.

  A new `checkNotInternallyPaused` function in `PauseStorageWrapper` and the corresponding
  `onlyNotInternallyPaused` modifier in `PauseModifiers` check only the internal `paused` flag.
  `removeExternalPause` now uses this narrower guard: the manager can remove a stuck external pause
  contract as long as the token has not been explicitly paused via the internal flag.
  `addExternalPause` and `updateExternalPauses` retain the full `onlyUnpaused` guard unchanged.

- ff38bca: The external pause, control and KYC lists are each iterated in full on the hot path of token
  operations (`isExternallyPaused`, `isExternallyAuthorized`, `isExternallyGranted`). These checks
  run inside the `onlyUnpaused` / compliance guards of every transfer, mint, burn, etc. Because the
  lists were unbounded, they could grow large enough that the iteration alone exceeds the block/tx
  gas limit — most critically for external pauses, where it would cause every operation to revert
  and permanently brick the token.

  A gas benchmark using the external-pause mock measured ~7,717 gas per entry for the cheapest
  possible external contract (a single `SLOAD`), with real contracts costing more, so the cost
  grows linearly and without bound.

  A new `MAX_EXTERNAL_LIST_SIZE` constant (= 10) caps every external list. The bound is enforced at
  the single chokepoint `ExternalListManagementStorageWrapper.addExternalList`, through which all add
  paths flow (single add, bulk `updateExternal*`, and the three initialisers), so it applies
  uniformly to pauses, control lists and KYC lists. Adding an entry that would grow a list beyond the
  cap reverts with the new shared error `ICommonErrors.MaxExternalListSizeReached`. Re-adding an
  existing member is unaffected. The cap comfortably exceeds any realistic number of providers.

- 45fdace: Fix FIND-022: reject `address(0)` in `SsiManagementStorageWrapper.addIssuer`.

  `addIssuer` in `SsiManagementStorageWrapper` delegated directly to `EnumerableSet.add` without any zero-address check, allowing `address(0)` to be registered as a trusted credential issuer. A listed zero address would permanently pollute the issuer list and could interfere with any SSI validation logic that iterates or looks up issuers.

  The fix adds an explicit `address(0)` guard at the top of `addIssuer`, reverting eagerly with `ICommonErrors.ZeroAddressNotAllowed()` before the set mutation. The check is placed at the storage-wrapper layer (layer_0) so it is enforced regardless of the call path.

- 76325eb: Fix audit finding 024: clearing redeem approval never finalised the burn, leaving orphaned tokens in `totalSupply`.

  `clearingRedeemCreation` debits the holder balance and the partition balance at creation time, but `performTransfer(_from, address(0), _amount)` skips the credit to `address(0)` and therefore never decrements `totalSupply` / `totalSupplyByPartition`. The approval path in `clearingRedeemExecution` only ran identity/compliance checks and cleared the bookkeeping, so the burn was never finalised: the holder's balance stayed reduced, `totalSupply` stayed inflated, and the tokens became unowned. All ownership-ratio calculations (dividends, coupons, voting) were skewed by the inflated supply.

  The approval branch now mirrors `redeemByPartition`'s finalisation:
  - Snapshots `totalSupply` for the partition before the burn so historical queries (`totalSupplyAt`) keep returning pre-burn values.
  - Calls `reduceTotalSupplyByPartition` to decrement both the partition supply and the ERC-20 `totalSupply` (the holder/partition balances were already debited at creation).
  - Invokes `ICompliance.destroyed` on the default partition, matching the canonical burn flow.
  - Emits `RedeemedByPartition` with the original `data` / `operatorData` so off-chain indexers see the burn.

  The cancel/reclaim branch is unchanged and still restores the ABAF-adjusted amount to the holder.

- 9a343f4: Fix FIND-025: remove `onlyClearingActivated` guard from clearing resolution functions.

  `approveClearingOperation`, `cancelClearingByValidator`, and `executeClearingOperation` all carried the `onlyClearingActivated` modifier. This meant that once clearing was disabled by an admin, any already-submitted clearing operations became permanently unresolvable — tokens locked in the clearing process could never be released or returned, regardless of the operation's state or expiry.

  The fix removes `onlyClearingActivated` from those three functions. Whether clearing is currently enabled is a gate for _creating_ new operations, not for _resolving_ ones already in flight.

- 521b5a4: Fix FIND-031: clearing transfer and redeem creation entry points did not validate that `_amount > 0`, allowing zero-amount operations that increment storage counters and pollute on-chain state with no economic effect. Add `InvalidClearingAmount` custom error to `IClearingTypes`, add `checkNonZeroClearingAmount` helper to `ClearingStorageWrapper`, and call it as the first guard in `ClearingOps.clearingTransferCreation` and `ClearingOps.clearingRedeemCreation`.
- 54a7ce1: Fix FIND-033: exclude disabled corporate actions from pending task aggregations.

  Previously, `getPendingScheduledCouponListingTotalAt` and `getPendingScheduledBalanceAdjustmentsAt` included tasks whose corporate action had been cancelled (disabled), causing `getCouponsOrderedListTotal`, `getCouponsOrderedList`, `getCouponFromOrderedListAt`, and projected balance queries (`balanceOfAt`, `totalSupplyAdjustedAt`, `getMaxSupplyAdjustedAt`) to count or apply cancelled tasks as if they were still active.

  A `bool _includeDisabled` flag was added to both aggregation functions and propagated to all internal callers. All callers that compute live values pass `false`, so disabled tasks are transparently skipped.

  The flag is now also exposed on all external count and list entrypoints — `getCouponFromOrderedListAt`, `getCouponsOrderedList`, `getCouponsOrderedListTotal`, `scheduledCouponListingCount`, `getScheduledCouponListing`, `scheduledSnapshotCount`, `getScheduledSnapshots`, `getPendingBalanceAdjustmentCount`, and `getScheduledBalanceAdjustments` — so callers can explicitly opt in to including disabled items (useful for debugging and auditing). Pass `false` to preserve the default behaviour of returning only active items.

- 139c679: Fix FIND-033: remove try/catch from scheduled task dispatch so failures revert the queue.

  Previously, `triggerScheduledTasks` wrapped each `ScheduledTasksDispatchOps.execute` call in a `try/catch`: a failing task silently cancelled the corporate action, emitted `TaskExecutionFailed`, and let the queue continue. This masked errors and allowed bad state to accumulate.

  The fix removes the `try/catch` entirely. A failing dispatch now reverts the entire `triggerScheduledTasks` call, leaving the queue intact at the failing task. The queue remains blocked until an authorised caller uses one of the force-cancel methods introduced in the same fix (see `feat-find-033-force-cancel-corporate-actions`) to remove the stuck action and let processing resume.

  The `TaskExecutionFailed` event has been removed from `IScheduledCrossOrderedTasks` as it is no longer emitted. The dead-code helpers `_onTaskExecutionFailed`, `_cancelPendingSubTaskAction`, `_cancelTopQueueAction`, and `_getActionIdFromScheduledTask` have also been removed from `ScheduledTasksStorageWrapper`.

- 61026ac: Fix: `initializeKpiLinkedRate` now validates `interestRate` and `impactData` at initialisation time.

  Previously, `initializeKpiLinkedRate` accepted any `InterestRate` and `ImpactData` structs without checking their contents. Invalid values (e.g. zero oracle address, out-of-range rate bounds) could be written to storage during deployment and would only surface as failures later during coupon or payout operations.

  The fix adds the `onlyValidInterestRate` and `onlyValidImpactData` modifiers to `initializeKpiLinkedRate` in `KpiLinkedRate.sol`, applying the same validation that `setKpiLinkedRateInterestRate` and `setKpiLinkedRateImpactData` already enforced on updates. Deployments with invalid initial parameters now revert immediately at the factory level.

- 0311554: Fix FIND-045: guard against `uint256` underflow when computing the KPI report lookback window in `KpiLinkedRateLib::_collectImpactData`. The expression `fixingDate - reportPeriod` was evaluated without validating that `reportPeriod <= fixingDate`, so a misconfigured `reportPeriod` (greater than the coupon `fixingDate`) reverted every KPI-linked rate calculation. Because the calculation runs from the scheduled-tasks queue, a single bad configuration could permanently freeze coupon processing for the asset.

  The subtraction is now staged through `windowStart = fixingDate > reportPeriod ? fixingDate - reportPeriod : fixingDate`. When `reportPeriod` exceeds `fixingDate`, the lookup window collapses to `[fixingDate, fixingDate]`, no KPI record is found, and the rate falls back to the existing missed-report branch (`_getRateWhenNoReport`) instead of reverting. Existing behaviour for valid configurations is unchanged.

- 6772b75: Fix: scheduled tasks now fire at their exact timestamp instead of one block late.

  Previously, `ScheduledTasksCommon::_triggerScheduledTasks` used a strict less-than comparison (`currentScheduledTask.scheduledTimestamp < _timestamp`), meaning a task scheduled for timestamp `T` would only fire when `block.timestamp > T`, not at `T` itself. For time-sensitive financial operations such as bond coupon payments this introduced a systematic one-block delay.

  The fix changes the comparison to less-than-or-equal (`<=`) so tasks fire as soon as the block timestamp reaches their scheduled timestamp.

- d132f3f: Fix FIND-047: remove stale and unused `pos` and `scheduledTasksLength` parameters from `ScheduledTasksDispatchOps.execute()`.

  Both parameters were captured before the processing loop and passed stale to each callback invocation — `scheduledTasksLength` reflected the pre-execution queue count rather than the live count after each `popScheduledTask`, and `pos` was the pre-pop index. All three handlers (`snapshot`, `coupon`, `balance`) and the `crossOrdered` branch ignored both parameters entirely, making them dead code and a future correctness hazard.

  The fix removes `pos` and `scheduledTasksLength` from `execute()` and its three private handlers, and cleans up both call sites in `ScheduledTasksStorageWrapper` (`triggerScheduledTasks` and `_triggerOneSubTask`). A regression test covering three due tasks processed in a single call is added to `scheduledTasks.test.ts`.

- 50cc8bd: Fix: guard against `uint256` overflow in unbounded multiplications inside the coupon and principal calculation paths.

  Two computation paths multiplied large operands without intermediate division, so realistic high-precision bond configurations could push the running product past `uint256` and revert every view that exercises them — permanently freezing coupon payouts and principal queries.
  - `CouponStorageWrapper._calculateCouponAmount` materialised the full four-way product `tokenBalance · nominalValue · rate · period` before applying the denominator. The numerator is now staged via `Math.mulDiv(tokenBalance, nominalValue, 10**nominalValueDecimals)`, consuming the nominal scale inside a 512-bit intermediate and folding the remainder into the denominator. The resulting fraction is mathematically equivalent; intermediate products no longer approach 256 bits at realistic precision.
  - `BondStorageWrapper.getPrincipalFor` collapsed `balance * nominalValue` into the numerator on the same uncapped path. It now uses `Math.mulDiv(balance, nominalValue, 10**nominalValueDecimals)` and keeps the token-decimal scale in the denominator, preserving sub-unit precision for small balances while gaining 512-bit headroom for high-precision configurations.

  The public fraction-returning API on `IPrincipal.PrincipalFor` and `ICouponTypes.CouponAmountFor` is preserved; only the internal decomposition of `numerator` / `denominator` changes, so off-chain registry, SDK and frontend consumers that divide the pair at presentation time remain compatible. Integration tests that asserted the previous literal decomposition were updated to the equivalent fraction.

  The third location flagged by the audit — `ScheduledTasksStorageWrapper.getPendingScheduledBalanceAdjustmentsAt` accumulating `pendingABAF_ *= factor` — is left untouched in this changeset. The codebase treats `pendingABAF_` as the raw product of integer factors (the matching synchronous path `AdjustBalancesStorageWrapper.updateAbaf` also performs `getAbaf() * factor` directly), and many balance, supply and freeze paths consume `pendingABAF_` as the integer multiplier rather than as a decimal-scaled ratio. Folding `mulDiv` into the loop would change that convention and silently shrink every adjusted balance reading across the diamond. Addressing the audit's concern there requires a coordinated update of the ABAF convention plus its consumers, which is out of scope for this patch.

- 5a111b9: Fix: guard against `uint256` overflow in the dividend amount calculation for large institutional holdings.

  `DividendStorageWrapper.getDividendAmountFor` computed the payable numerator as a direct `tokenBalance * amount` multiplication. For institutional holders with large balances or high-precision dividend amounts the intermediate product can exceed the `uint256` maximum (≈ 1.16 × 10^77), causing a permanent revert for every subsequent view and claim that exercises that path — permanently freezing dividend access for the affected holder.

  The numerator is now computed via `Math.mulDiv(tokenBalance, amount, DecimalsLib.pow10(decimals))`, which performs the multiplication with 512-bit intermediate precision and folds the token-decimal scale into the division, keeping intermediate products bounded. The denominator is reduced to `DecimalsLib.pow10(amountDecimals)` accordingly. The resulting fraction is mathematically equivalent to the previous `(tokenBalance * amount) / 10^(decimals + amountDecimals)`.

  The public `IDividendTypes.DividendAmountFor` API is preserved; only the internal decomposition of `numerator` / `denominator` changes, so off-chain consumers that divide the pair at presentation time remain compatible. Integration tests that asserted the previous literal decomposition were updated to the equivalent fraction.

- f8f817d: Fix: `recoveryAddress` now rejects a `_newWallet` that has already been used in a prior recovery.

  Previously, `recoveryAddress` applied `onlyUnrecoveredAddress` only to `_lostWallet`, leaving `_newWallet` unchecked. An already-recovered address could therefore be supplied as the recovery target, silently overwriting its recovered state and producing inconsistent on-chain identity data.

  The fix adds `onlyUnrecoveredAddress(_newWallet)` to `recoveryAddress` in `Recovery.sol`, enforcing that the destination wallet is a fresh address with no prior recovery record. Calls that supply an already-recovered `_newWallet` now revert immediately.

- 5dabf42: Fix: `recoveryAddress` now follows the Checks-Effects-Interactions pattern to prevent re-entrancy.

  Previously, `recoveryAddress` in `ERC3643StorageWrapper` set the `addressRecovered` state flags **after** calling `ERC20StorageWrapper.transfer`, which triggers the external `compliance.transferred()` callback. A malicious compliance module could re-enter `recoveryAddress` during that callback while `addressRecovered[_lostWallet]` was still `false`, bypassing `onlyUnrecoveredAddress` and initiating a second recovery of the same lost wallet.

  The fix moves the `addressRecovered` assignments to before the transfer call, so any re-entrant attempt immediately reverts.

- 91d8262: Fix: `lockByPartition` and `transferAndLock` no longer return a misleading `bool success_` value.

  Previously, both functions declared a `bool success_` return that was always `true` — the underlying implementation either succeeds or reverts, so `false` can never be returned. This constituted dead code that misled integrators into writing defensive `require(success_, "Lock failed")` checks that are never triggered, wasted gas on unnecessary branching, and increased audit surface area without adding any functional value.

  The fix removes the `success_` return value from `lockByPartition` and `transferAndLock`, aligning the interface with the actual revert-on-failure behaviour of the internal implementation.

- 5d553af: Fix FIND-070: `replaceTokenHolder` silently corrupts `tokenHolders[0]` when `oldTokenHolder` is unregistered.

  `ERC1410StorageWrapper.replaceTokenHolder` looked up the old holder's index via `tokenHolderIndex[oldTokenHolder]`, which returns 0 for any unregistered address. Calling the function with an unregistered `oldTokenHolder` would overwrite `tokenHolders[0]` (the null slot, as valid indices start at 1) with `newTokenHolder` and zero out the old holder's mapping entry, corrupting the registry irreversibly without a manual storage fix.

  Added an existence check that reverts with `IERC1410Types.TokenHolderNotFound(oldTokenHolder)` when the resolved index is 0, before any storage mutation occurs. The new custom error `TokenHolderNotFound(address tokenHolder)` is declared in `IERC1410Types`.

  Added `MockERC1410StorageWrapper` test harness and three unit tests (two unhappy-path, one happy-path) covering the guard in the `SecurityHoldersFacet Tests` suite.

- 61f7072: Fix FIND-073: enforce sequential nonces in EIP-712 protected operations.

  `_isNonceValid` accepted any nonce strictly greater than the current value (`_currentNonce < _nonce`), allowing an attacker to submit a signed operation with an arbitrarily large nonce (e.g. 1000). The on-chain counter would jump to that value, permanently invalidating all intermediate pre-signed operations — a denial-of-service against legitimate pending signatures.

  `NonceStorageWrapper.setNonceFor` compounded the issue by directly assigning the caller-supplied value to storage instead of incrementing, making the jump persistent.

  The fix closes both vectors:
  - `_isNonceValid` now requires strict equality: `_nonce == _currentNonce + 1`.
  - `setNonceFor` signature changed to `setNonceFor(address _account)` — it unconditionally increments by 1 and no longer accepts an arbitrary value.
  - All call sites updated: `protectedTransferFromByPartition`, `protectedRedeemFromByPartition`, `protectedCreateHoldByPartition`, the three `protectedClearing*` operations, and `ERC20Permit.permit`.

- 0ae44da: Fix FIND-090: guard against `address(0)` reaching snapshot and batch state-writing functions.

  Three entry points allowed `address(0)` to reach internal state-writing functions with no validation, creating phantom snapshot entries or bypassing the zero-address checks enforced by their single-call counterparts.

  `updateAccountSnapshot` in `SnapshotsStorageWrapper` unconditionally wrote a snapshot entry for whatever account was passed. Clearing-creation functions (`clearingTransferCreation`, `clearingRedeemCreation`, `clearingHoldCreationCreation`) intentionally pass `address(0)` as the destination at creation time, so with an active snapshot this produced a phantom storage entry for `address(0)`.

  `batchFreezePartialTokens` and `batchUnfreezePartialTokens` in `BatchFreeze` called `ERC1410StorageWrapper.requireValidAddress` instead of `ExternalListManagementStorageWrapper.checkValidAddress`, which includes the zero-address check that the single-call `freezePartialTokens` and `unfreezePartialTokens` enforce.

  `batchTransfer` in `BatchTransfer` omitted the `checkValidAddress` call entirely for each recipient, while the single-call `transfer` path enforced it.

  The fix adds an `account == address(0)` early-return guard to `updateAccountSnapshot`, replaces the incorrect validator in `BatchFreeze`, and adds `checkValidAddress` to the recipient loop in `BatchTransfer`.

- 23925cf: Fix FIND-095: update allowance LABAF in `approve` to prevent allowance inflation.

  `ERC20StorageWrapper.approve` set `allowed[owner][spender] = value` directly without updating the Last Applied Balance Adjustment Factor (LABAF) for that allowance pair. Because `getAllowanceLabaf` returns 1 for any entry that has never been written, a subsequent call to `transferFrom` would enter `updateAllowanceAndLabaf` with a stale LABAF of 1 even when the global ABAF had already grown (e.g. to 2 via a balance adjustment). The result was that the stored allowance was silently multiplied by `currentAbaf / staleLabaf`, allowing the spender to transfer more tokens than the owner intended to approve.

  The fix adds a single call to `AdjustBalancesStorageWrapper.updateAllowanceLabaf` inside `approve`, anchoring the allowance LABAF to the current ABAF at the moment of approval. When `transferFrom` later invokes `updateAllowanceAndLabaf`, it finds `abaf == labaf` and leaves the stored allowance unchanged.

  A regression test was added to `allowance.test.ts` (FIND-095) that:
  1. Applies a balance adjustment (factor 2, ABAF goes from 1 → 2).
  2. Calls `approve` for 500 tokens.
  3. Asserts that `transferFrom` for 501 tokens reverts with `InsufficientAllowance` — which it did not before the fix.

- 98b74fa: Fix FIND-102: prevent the sole `DEFAULT_ADMIN_ROLE` holder from renouncing, which would permanently lock all admin-gated functions.

  `renounceRole` now calls `checkNotSoleAdmin` before revoking: if the role being renounced is `DEFAULT_ADMIN_ROLE` and the caller is the only remaining member, the transaction reverts with the new `CannotRenounceSoleAdmin` error. Renouncing is still allowed when at least one other admin exists.

- e2ad209: Fix FIND-109: guard `DecimalsLib.calculateDecimalsAdjustment` against arithmetic overflow.

  Two overflow scenarios were unguarded in the multiplication path (`_newDecimals > _decimals`):
  1. **Exponent overflow** — `10 ** decimalsDiff` wraps silently when `decimalsDiff >= 78`, because `uint256` can represent at most ~1.157 × 10^77. An explicit check `if (decimalsDiff >= MAX_DECIMALS) revert DecimalsTooLarge(_newDecimals)` now fires before `_pow10` is ever called with an out-of-range exponent.
  2. **Multiplication overflow** — even with a valid exponent, `_amount * multiplier` can exceed `uint256.max` when `_amount` is large. A second guard `if (_amount > MAX_UINT256 / multiplier) revert DecimalsTooLarge(_newDecimals)` catches this by checking the inverse inequality before multiplying.

  As secondary improvements:
  - The exponent guard is ordered before `_pow10` is called, so `_pow10` is never invoked with a wrapped exponent even on the revert path.
  - The result of `_pow10(decimalsDiff)` is cached in `multiplier` and reused for both the overflow check and the multiplication, eliminating a redundant call.
  - The multiplication itself is wrapped in `unchecked` since overflow is proven impossible at that point, saving the Solidity-generated overflow check.

- 7c16bef: Fix FIND-111: grant DEFAULT_ADMIN_ROLE to \_tRexOwner in SecurityDeploymentLib.\_prepareRbacs.

  `_prepareRbacs` only added `address(this)` (the `TREXFactoryAts` factory) as a `DEFAULT_ADMIN_ROLE` member. After deployment, `TREXBaseDeploymentLib::deployTREXSuite` calls `renounceRole(DEFAULT_ADMIN_ROLE)` on behalf of the factory, removing the sole holder. If the token owner did not explicitly include themselves in `DEFAULT_ADMIN_ROLE` during the initial RBAC setup, all admin-gated functions on the deployed token were permanently locked with no recovery path.

  The fix adds `_tRexOwner` alongside `address(this)` in the `DEFAULT_ADMIN_ROLE` members array appended by `_prepareRbacs`. The factory continues to hold the role temporarily during deployment and renounces it afterwards, while the token owner retains permanent admin access regardless of whether they passed an explicit RBAC configuration.

- f95fc0c: Prevent activation of diamond configurations with zero facets. `_activateConfiguration` now reverts with `EmptyFacetConfigurationNotPermitted` when the accumulated facet list for a batch version is empty, closing a vector where `createConfiguration` or `createBatchConfiguration` could register a configuration with no function selectors and brick any `ResolverProxy` following the latest version. [FIND-114]
- 9dde45b: Prevent `createConfiguration` from prematurely finalising an in-progress batch. `_createConfiguration` now reverts with `OngoingBatchConfigurationNotPermitted` when `_isOngoingConfiguration` returns true, closing a vector where calling `createConfiguration` on an open batch would absorb partial state and immediately activate the configuration — potentially missing facets intended for subsequent batch additions. [FIND-115]
- d8b6174: Fix FIND-120: zero-amount hold execution creates ghost partition, permanently blocking `fullRedeemAtMaturity`.

  `HoldStorageWrapper.createHoldByPartition` accepted `_hold.amount == 0` without validation. When such a hold was executed against a recipient who did not yet hold the relevant partition, `_transferHoldBalance` called `ERC1410StorageWrapper.addPartitionToOnly(0, _to, partition)`, writing a `Partition(0, partition)` entry into the recipient's partition array. At maturity, `Maturity.fullRedeemAtMaturity` iterated all partitions of the token holder, encountered the ghost entry with balance 0, and reverted via `_checkUnexpectedError` — permanently blocking redemption for that address.

  `ClearingOps.clearingHoldCreationCreation` was exposed to the same vector: a zero-amount clearing hold would also produce a ghost partition upon approval.

  The fix applies two complementary layers of defence:
  - **Root cause — hold and clearing-hold creation**: `HoldStorageWrapper.checkNonZeroHoldAmount` is a new internal pure function that reverts with `IHoldTypes.InvalidHoldAmount` when the amount is zero. `createHoldByPartition` calls it at entry, and `ClearingOps.clearingHoldCreationCreation` delegates to it via `HoldStorageWrapper`, keeping the guard in a single place.
  - **Defence in depth — maturity redemption**: `fullRedeemAtMaturity` no longer reverts on a zero-balance partition; it now skips it with `if (balance != 0)`, making the function resilient to any ghost partition that may already exist in storage.
  - **Hygiene guards**: `LockStorageWrapper.lockByPartition` rejects `amount == 0` with `ILockTypes.InvalidLockAmount`; `ERC3643StorageWrapper.freezeTokensByPartition` rejects `_amount == 0` with `IFreeze.InvalidFreezeAmount`. Neither operation can produce a ghost partition, but accepting a zero amount is semantically invalid and creates unnecessary storage noise.

  New errors added: `IHoldTypes.InvalidHoldAmount`, `ILockTypes.InvalidLockAmount`, `IFreeze.InvalidFreezeAmount`.

- 9df4f1d: Fix FIND-121: `CouponStorageWrapper._calculateCouponAmount` re-read the live `nominalValue` and `nominalValueDecimals` from `NominalValueStorageWrapper`, even when the holder balance and token decimals had been resolved at the snapshot bound to the coupon. When `setNominalValue` (or an ABAF adjustment changing decimal precision) ran between the coupon's record date and a `getCouponFor` / `getCouponAmountFor` query, the numerator and denominator were composed at incompatible scales — inflating or shrinking the fractional payable amount.

  `_calculateCouponAmount` now receives `nominalValue` and `nominalValueDecimals` as parameters, sampled by `getCouponFor` from the snapshot (via `SnapshotsStorageWrapper.nominalValueAtSnapshot` / `nominalValueDecimalsAtSnapshot`) or from live storage in the no-snapshot fallback. The helper no longer reads storage and is now `pure`, making the scale invariant the caller's responsibility and preventing the inconsistent-read defect at the type level.

- bb12115: Fix FIND-125: prohibit setting partition max supply to zero and remove the global-cap coherence check.

  `requireValidNewMaxSupplyByPartition` returned early when `_newMaxSupply == 0`, silently treating zero as "unlimited" and bypassing all validation. An admin could therefore remove a partition-level cap without any constraint, downgrading a bounded partition to unlimited with no revert.

  The fix replaces the early return with a `NewMaxSupplyCannotBeZero` revert, making partition-cap behaviour consistent with the global-cap validation already present in `requireValidNewMaxSupply`.

  Additionally, the check that prevented a partition cap from exceeding the global max supply (`NewMaxSupplyByPartitionTooHigh`) has been removed, as there is no business requirement for that constraint.

- 3f785d3: Fix FIND-127: add missing `onlyUnrecoveredAddress` guards to prevent recovered wallets from calling issue/mint operations and from being targeted by release/hold creation. Added `onlyUnrecoveredAddress(getMsgSender())` to `Mint.issue`, `Mint.mint`, and `BatchMint.batchMint` to block recovered callers; added `onlyUnrecoveredAddress(_tokenHolder)` to `Lock.release` and `LockByPartition.releaseByPartition` to prevent releasing locks back to dead wallets; added `onlyUnrecoveredAddress(_from)` to `ControllerHoldByPartition.controllerCreateHoldByPartition` to block holds on recovered token holders.
- b724201: Fix FIND-128: guard `controllerCreateHoldByPartition` against active clearing.

  Added the `onlyClearingDisabled` modifier to `ControllerHoldByPartition.controllerCreateHoldByPartition`. Without it, a controller could place a hold on a partition that is currently under a clearing workflow, potentially conflicting with in-flight clearing operations and leaving the asset in an inconsistent state.

- 161bdcd: Fix FIND-134: align expiration boundary behaviour across all encumbrance types. `HoldStorageWrapper::isHoldExpired` and `ClearingStorageWrapper::requireExpirationTimestamp` used a strict `>` comparison, so holds and clearings were not considered expired at exactly `block.timestamp == expirationTimestamp`, while `LockStorageWrapper::isLockedExpirationTimestamp` used `<=` and treated the same instant as expired. Change both hold and clearing checks from `>` to `>=` so all three encumbrance types share inclusive expiration semantics: an operation is expired at the expiration timestamp, not one second after.
- 8f248ba: Fix FIND-135: wrap revocation registry call in `try/catch` in `KycStorageWrapper.getKycStatusFor`.

  The external call to `IRevocationList.revoked()` was made without error handling. If the revocation registry contract reverted for any reason (bug, upgrade, misconfiguration), every KYC status check for accounts with internal KYC would revert as well, blocking all KYC-dependent operations such as transfers.

  The call is now wrapped in a `try/catch`. If the registry reverts, the catch block treats the credential as not revoked and allows execution to continue — a deliberate fail-open policy that preserves availability when the registry is unreachable.

- 1d916fd: Fix: `addSelectorsToBlacklist` and `removeSelectorsFromBlacklist` now enforce the `onlyUnpaused` modifier.

  Previously, both functions only checked `onlyRole(DEFAULT_ADMIN_ROLE)`, allowing an admin to modify the selector blacklist while the contract was paused. This was inconsistent with sibling functions `createConfiguration` and `registerBusinessLogics`, which already require the contract to be unpaused before executing state changes.

  The fix adds `onlyUnpaused` to both functions, making pause-gating uniform across all admin write operations on `BusinessLogicResolver`.

- 6eaa436: Fix FIND-138: prevent wallet recovery while the token is paused.

  Added the `onlyUnpaused` modifier to `Recovery.recoveryAddress`. Without it, an agent could trigger a wallet recovery — migrating token balances and marking the old wallet as permanently decommissioned — even when the contract is paused. Since a pause is intended to halt all state-mutating operations during emergencies or maintenance windows, allowing recovery to proceed in that state could result in balance migrations that cannot be undone once the pause is lifted.

- 13dc199: Compliance module never received `transferred` / `created` / `destroyed` notifications for operations on non-default partitions, letting investors accumulate tokens cross-partition without triggering per-holder or per-transfer compliance checks.

  `ERC1410StorageWrapper`, `HoldStorageWrapper` and `ClearingLifecycleOps` all gated the ERC-3643 compliance hook behind `partition == _DEFAULT_PARTITION`. Issuances, transfers, redemptions, hold executions and clearing approvals on any other partition were silently invisible to the external compliance contract, so on-chain compliance limits (max holders, max balance per holder, transfer caps) could be bypassed by simply operating on a non-default partition.

  The fix removes the partition gate from every notification site so the compliance module is notified for every partition:
  - `ERC1410StorageWrapper.transferByPartition` / `issueByPartition` / `redeemByPartition` fire `transferred` / `created` / `destroyed` regardless of partition; the only remaining short-circuit on transfer is the self-transfer guard (`from != to`).
  - `HoldStorageWrapper._notifyTransferComplianceIfNeeded` fires on every hold transfer, keeping just the self-transfer guard (`tokenHolder == _to`).
  - `ClearingLifecycleOps.clearingTransferExecution` / `clearingRedeemExecution` notify on every clearing approval regardless of partition; the zero-address compliance target short-circuits inside `LowLevelCall.functionCall`, so no explicit address check is needed. This site was originally fixed in `ClearingOps` but the partition gate was reintroduced when the library was split into `ClearingOps` + `ClearingLifecycleOps` to stay below the EIP-170 24 KiB cap; this changeset re-applies the fix in its new location.

  Adds integration coverage in `compliance.test.ts` (`Compliance notifications (multi partition)`) for issue / transfer / redeem / hold execution / clearing transfer / clearing redeem on a non-default partition, asserting the corresponding `complianceMock` hit counter increments.

- 778669c: Fix: add `onlyActivated` guard to all role-mutating functions in `AccessControl`.

  `grantRole`, `revokeRole`, `renounceRole`, and `applyRoles` lacked the `onlyActivated` modifier, meaning that after a token was deactivated it was still possible to modify role assignments. A deactivated token should be immutable in all respects — including its access-control configuration.

  The fix adds `onlyActivated` as the first modifier on each of those four functions, ensuring any role mutation attempt on a deactivated token reverts with `Deactivated`.

- 9a7b97f: Fix: reject impact data where baseLine equals maxDeviationFloor or maxDeviationCap.

  `requireValidImpactData` used strict greater-than comparisons (`>`), allowing `baseLine == maxDeviationFloor` and `baseLine == maxDeviationCap` as valid inputs. Either equality produces a zero denominator in `_calculateKpiLinkedInterestRate`, which reverts on every subsequent token operation and permanently freezes the protocol.

  The fix tightens both comparisons to `>=`, enforcing `maxDeviationFloor < baseLine < maxDeviationCap` as a strict invariant.

- 1b0f5ae: Enable `configureYulOptimizer` in the Solidity coverage configuration to fix coverage
  collection failures caused by the Yul optimiser pipeline. No on-chain behaviour or public
  ABI is affected.
- a034245: Fix BBND-1703: Hiero Solo deployment failure during facet registration.

  The `deploySystemWithNewBlr` workflow's "Step 4/12: Registering facets in BLR" step was racing on the Hedera Solo JSON-RPC relay. It fired one parallel `eth_call` per facet (≈101 concurrent reads of `getStaticResolverKey()`) via `Promise.all`, which Hardhat's in-process provider absorbs but the Hedera relay rejects/rate-limits. The deterministic resolver keys are already available offline via `getFacetDefinition()` from `@scripts/domain`, so the registration phase now reads them synchronously from the registry instead of fanning out RPC calls.

  Two related fixes ride along:
  - The `error()` / `warn()` / `debug()` loggers were silently dropping their `data` argument in text mode, masking the real exception body in CI logs (`❌ Deployment failed:` with no details). Text mode now also prints `Error.name` / `message` / `stack` and ethers-specific fields (`reason`, `shortMessage`, `code`, `data`).
  - `registerFacets()` had an off-by-one in its batch loop (`length / FACET_REGISTRATION_BATCH_SIZE` without `Math.ceil` plus `i <= iterations`) that would have sent an empty final transaction whenever the facet count was an exact multiple of the batch size. Hardened with `Math.ceil`, strict `<`, and a defensive empty-slice guard.

- 544b64d: Fix: add `onlyActivated` guard to all external state-changing functions across all facets.

  All external, non-view, non-pure functions in every facet were missing the `onlyActivated` modifier, meaning that after a token was deactivated through `DeactivateFacet.deactivate()` it was still possible to invoke any state-mutating operation — minting, transferring, freezing, role management, document updates, coupon/dividend/clearing operations, etc. A deactivated token must be fully immutable.

  The fix adds `onlyActivated` as the **first** modifier on every such function across all facets, ensuring any state-mutating call on a deactivated token reverts with the `Deactivated` custom error. Initialize functions are deliberately excluded, as those must remain callable during the token's setup phase regardless of activation state.

  `DeactivateFacet` was also added to the loan token configuration, which previously lacked the ability to deactivate loan tokens.

  Each facet's integration test file now includes a `describe("Deactivated")` block that verifies the guard is active after a `deactivate()` call.

- 8ef4709: Fix: self-transfer of full balance silently removes holder from registry.

  In `beforeTokenTransfer`, a self-transfer (`from == to`) with the full balance caused `removeFrom = true` (full balance transferred) while `addTo = false` (recipient already had balance), triggering `removeTokenHolder(from)` even though the holder still retained their tokens. Any affected holder would be excluded from all future dividend, coupon, and corporate action distributions.

  Fix adds an early return at the top of `beforeTokenTransfer` when `from == to`. A self-transfer produces no net balance change, so no snapshot updates, holder registry mutations, or balance adjustments are needed.

- cf2d0b0: Extract `SecurityFacet` as an independent Diamond facet and fix `InterestRate`/`Kyc` initialisation guards.

  **Security split (MAF fix):** `BondUSA`, `EquityUSA`, `Loan`, and `LoansPortfolio` were calling `SecurityStorageWrapper.initializeSecurity` directly inside their own initialisers, violating the Modular Asset Factory principle that each `StorageWrapper` must be owned by exactly one facet. A new `SecurityFacet` is introduced as the sole owner of `SecurityStorageWrapper` operations. The security initialisation call is removed from all four asset initialisers and from `Factory.sol`, which now uses a `_tryInitializeSecurity` helper following the existing `_tryInitialize*` pattern for optional facet init. `SecurityModifiers.sol` is added as the service layer for security-scoped modifiers. Resolver key `SECURITY_RESOLVER_KEY` is registered in `resolverKeys.sol`. All `createConfiguration.ts` files for bond, bondFixedRate, bondKpiLinkedRate, equity, loan, and loanPortfolio are updated to include `SecurityFacet` in the facet list.

  **Initialisation flag fix:** `InterestRateStorageWrapper` gained an `_initialized` flag (matching the pattern used by other storage wrappers) so that `InterestRate.initializeInterestRate` is idempotent. `InterestRateModifiers` and `KycModifiers` are updated to use the new guard; `Kyc.sol` and `InterestRate.sol` are updated accordingly.

- a60f779: Fix stale storage slots left behind by swap-and-pop removal in token holder and document registries.

  **Ghost address in `ERC1410StorageWrapper.removeTokenHolder` (`ERC1410StorageWrapper.sol`)**
  The swap-and-pop routine moved the last holder into the vacated slot and decremented `totalTokenHolders`, but never issued `delete basicStorage.tokenHolders[lastIndex]`. The mapping slot at the old `lastIndex` retained the address that had just been moved, creating a permanently stale entry. Any off-chain or on-chain consumer reading that slot directly received a phantom address. Adds the missing `delete` call after the counter decrement.

  **Stale index entry in `DocumentationStorageWrapper.removeDocumentEntry` (`DocumentationStorageWrapper.sol`)**
  After swap-and-pop removal, `delete docStorage.documents[_name]` was issued but `delete docStorage.docIndexes[_name]` was not. The `docIndexes` mapping kept a non-zero value pointing at the slot now occupied by a different document, leaving inconsistent state that could confuse off-chain tooling or future reads of the index. Adds the missing `delete docStorage.docIndexes[_name]` alongside the existing document delete.

  **Regression tests**
  Both fixes are covered by new storage-level tests that compute the affected mapping slot via `keccak256(key || mappingBaseSlot)` and assert the slot equals `bytes32(0)` after the removal operation. Tests are added to `SecurityHolders.test.ts` and `documentation.test.ts` respectively.

- 41b61a2: Fix voting power updates on balance-movement paths that previously bypassed `ERC20VotesStorageWrapper.afterTokenTransfer`.

  Four paths moved tokens between balance buckets (or between holders) without
  notifying the ERC20Votes hook, so `DelegateVotesChanged` was never emitted and
  voting-power checkpoints drifted from the actual controlled balance
  (`balanceOf + locked + held + cleared + frozen`):
  - `HoldStorageWrapper.transferHold` (hold execution)
  - `LockStorageWrapper._releaseByPartition` (lock release)
  - `ERC3643StorageWrapper.unfreezeTokensByPartition` (frozen-balance restore)
  - `ClearingOps.transferClearingBalanceInternal` (clearing approval)

  The fix calls `afterTokenTransfer` in all four sites passing the **real
  `from`** instead of `address(0)`:
  - Hold execution: `from = _holdIdentifier.tokenHolder`, `to = _to`.
  - Lock release: `from = tokenHolder`, `to = tokenHolder` → `from == to` makes
    `moveVotingPower` a no-op (same-holder bucket move, no net voting-power
    change).
  - Unfreeze: `from = _account`, `to = _account` → same-holder no-op.
  - Clearing balance transfer: `transferClearingBalance` and
    `transferClearingBalanceInternal` take a new `_from` parameter; the four
    callers (`clearingTransferExecution` ×2, `clearingRedeemExecution`,
    `clearingHoldCreationExecution`) pass `_id.tokenHolder`.

  Why this matters: voting power in this codebase is the holder's total
  controlled balance across all buckets. Using `from = address(0)` would treat
  every restore/transfer as a mint, inflating both the recipient delegate's
  votes and `totalSupplyCheckpoints` even when tokens never actually entered
  circulation. Passing the real `from` makes cross-holder transfers subtract
  from the sender's delegate and add to the recipient's delegate, and keeps
  intra-holder bucket moves (lock release, unfreeze) as no-ops.

- 8d54a06: Migrate the entire Coupon facet family to library composition (BBND-1710).

  `CouponFacet`, `CouponFixedRateFacet`, `CouponKpiLinkedRateFacet`, and
  `CouponSustainabilityPerformanceTargetRateFacet` no longer inherit the abstract
  `Coupon` / `CouponFacetBase` scaffold. Each facet now declares its own external
  bodies and selector array, calls the existing `CouponStorageWrapper` and
  `InterestRateStorageWrapper` libraries directly, and inlines variant-specific
  rate-resolution previously hidden behind the virtual `_prepareCoupon` hook.
  `Coupon.sol` and `CouponFacetBase.sol` are removed (no remaining consumers).

  ABI, selector set, `interfaceId`, and resolver keys are unchanged for every
  facet. Aggregate Coupon-family bytecode shrinks 180 bytes.

- 6c83bd8: Relocate `ProtectedPartitions` facet out of `layer_1/` nesting into `facets/protectedPartition/` as part of the POST-MAF layer-flattening effort, and add missing NatSpec documentation to all three files.

  What changes:
  - `facets/layer_1/protectedPartition/` moved to `facets/protectedPartition/`. Directory name follows the existing lowercase-camelCase convention.
  - Import paths updated in all callers: `ProtectedPartitionsStorageWrapper.sol`, `IProtectedByPartition.sol`, `ProtectedByPartition.sol`, `ProtectedPartitionsFacetTimeTravel.sol`.
  - `IProtectedPartitions`: document `ProtectionData` struct fields, all events (`PartitionsProtected`, `PartitionsUnProtected`, `ProtectedTransferFrom`, `ProtectedRedeemFrom`), all errors (`PartitionsAreProtectedAndNoRole`, `PartitionsAreUnProtected`, `PartitionsAreProtected`), and `initializeProtectedPartitions`.
  - `ProtectedPartitions`: add contract-level `@title`/`@author`/`@notice`/`@dev` block.
  - `ProtectedPartitionsFacet`: add contract-level NatSpec and `@inheritdoc` tags on all three `IStaticFunctionSelectors` overrides.

  No ABI, selector, or storage layout changes.

- 9d9eac5: Fix: [FIND-005] make the per-holder partition-list snapshot O(1) per mutation to close a partition-spam denial-of-service.

  `SnapshotsStorageWrapper` snapshotted a holder's partition list by copying the whole `partitionsOf(holder)` array into a single `accountPartitionMetadata[holder]` entry (`PartitionSnapshots` holding a `ListOfPartitions`). Each capture was O(N) in the holder's partition count: one cold SSTORE (~22,100 gas) per `bytes32` element, plus the O(N) `partitionsOf` SLOAD pass. Because anyone can grow a victim's `partitions[]` array by sending 1 wei under a fresh partition id, an attacker could inflate the list until any operation that captured it exceeded the block gas limit, permanently bricking the victim's transfers and redemptions.

  The list snapshot is now stored per array index, mirroring the existing security-holders snapshot pattern (`tokenHoldersSnapshots`):
  - `accountPartitionMetadata`, `PartitionSnapshots` and `ListOfPartitions` are removed. New storage holds `accountPartitionsByIndexSnapshots[holder][index]` (a `SnapshotsBytes32` history of the partition id living at each slot) and `accountTotalPartitionsSnapshots[holder]` (a `Snapshots` history of the list length). `SnapshotsBytes32` and the `updateSnapshotBytes32` / `bytes32ValueAt` primitives are added alongside their `address` counterparts.
  - `ERC1410StorageWrapper.addPartitionToOnly` captures only the pre-push length via `updateTotalPartitionsSnapshot`; the freshly appended slot needs no per-index capture. `deletePartitionForHolder` captures the length plus the two slots about to lose their value (the swapped-into index and the popped tail index) via `updatePartitionAtIndexSnapshot`, before the swap-and-pop. Every mutation now writes at most three slots regardless of N.
  - `partitionsOfAtSnapshot` reconstructs the list slot-by-slot: it reads the historical length, then for each index resolves the per-index history, falling back to the live `partitions[holder]` slot when no capture exists at that snapshot. The reader stays `view`, so the O(N) reconstruction is never paid by an on-chain mutation.

  Historical reads are unchanged in behaviour. New integration tests in `snapshotsByPartition.test.ts` cover the previously untested delete path: removing a middle partition (swap branch), removing the last partition (no-swap branch), and multiple removals within a single snapshot (idempotency), each asserting that earlier snapshots still return the pre-mutation list.

- 303c70b: Relocate `ERC20Permit` facet out of `layer_1/ERC1400/` nesting into `facets/erc20Permit/` as part of the POST-MAF layer-flattening effort.

  What changes:
  - `facets/layer_1/ERC1400/ERC20Permit/` moved to `facets/erc20Permit/`. Directory name follows the existing `eip712/` lowercase-camelCase convention.
  - Import paths updated in all callers: `IAsset.sol`, `ERC20PermitStorageWrapper.sol`, `Factory.sol`.
  - `ERC20PermitFacetTimeTravel` removed — the asset time-travel contract already covers this facet; the dedicated wrapper was redundant.

  No ABI, selector, or storage layout changes.

- b6fb30f: Relocate `ERC20Votes` facet out of `layer_1/ERC1400/` nesting into `facets/erc20Votes/` as part of the POST-MAF layer-flattening effort.

  What changes:
  - `facets/layer_1/ERC1400/ERC20Votes/` moved to `facets/erc20Votes/`. Directory name follows the existing `eip712/` lowercase-camelCase convention.
  - Import paths updated in all callers: `IAsset.sol`, `ERC20VotesStorageWrapper.sol`, `Factory.sol`.
  - `ERC20VotesFacetTimeTravel` removed — the asset time-travel contract already covers this facet; the dedicated wrapper was redundant.

  No ABI, selector, or storage layout changes.

- 2d94c09: Relocate `Kyc` facet out of `layer_1/` nesting into `facets/kyc/` as part of the POST-MAF layer-flattening effort.

  What changes:
  - `facets/layer_1/kyc/` moved to `facets/kyc/`. Directory name follows the existing lowercase-camelCase convention.
  - Import paths updated in all callers: `IAsset.sol`, `Factory.sol`, `KycStorageWrapper.sol`, `ExternalListManagementStorageWrapper.sol`, `ERC1594StorageWrapper.sol`, `KycModifiers.sol`, `ExternalKycListManagement.sol`, `IExternalKycListManagement.sol`, `IExternalKycList.sol`, `Maturity.sol`, `MaturityByPartition.sol`, `MockedExternalKycList.sol`.
  - `KycFacetTimeTravel` removed — the asset time-travel contract already covers this facet; the dedicated wrapper was redundant.

  No ABI, selector, or storage layout changes.

- 58b906b: Relocate `Lock` facet out of `layer_1/` nesting into `facets/lock/` as part of the POST-MAF layer-flattening effort.

  What changes:
  - `facets/layer_1/lock/` moved to `facets/lock/`. Directory name follows the existing lowercase-camelCase convention.
  - Import paths updated in all callers: `IAsset.sol`, `Factory.sol`, `LockStorageWrapper.sol`, `ILockByPartition.sol`.
  - `LockFacetTimeTravel` removed — the asset time-travel contract already covers this facet; the dedicated wrapper was redundant.

  No ABI, selector, or storage layout changes.

- 428d229: Relocate `OperatorClearingHoldByPartition` facet and shared type interfaces out of `layer_1/` nesting into top-level `facets/` subdirectories as part of the POST-MAF layer-flattening effort.

  What changes:
  - `facets/layer_1/clearing/operatorClearingHoldByPartition/` moved to `facets/operatorClearingHoldByPartition/`.
  - `facets/layer_1/clearing/IClearingTypes.sol` moved to `facets/clearing/IClearingTypes.sol`.
  - `facets/layer_1/hold/IHoldTypes.sol` moved to `facets/hold/IHoldTypes.sol`.
  - Import paths updated in all callers: `IOperatorClearingByPartition.sol`, `IOperatorHoldByPartition.sol`, `OperatorHoldByPartition.sol`, `OperatorClearingHoldByPartition.sol`, `OperatorClearingHoldByPartitionFacet.sol`.

  No ABI, selector, or storage layout changes.

- 1c58076: Relocate `TransferAndLock` facet out of `layer_3/` nesting into `facets/transferAndLock/` as part of the POST-MAF layer-flattening effort.

  What changes:
  - `facets/layer_3/transferAndLock/` moved to `facets/transferAndLock/`. Directory name follows the existing lowercase-camelCase convention.
  - Import paths updated in all callers: `IAsset.sol`, `Factory.sol`, `ITransferAndLockByPartition.sol`.
  - Internal imports updated inside the moved files (`TransferAndLock.sol`, `TransferAndLockFacetBase.sol`, and the three variant facets).
  - `TransferAndLockFacetTimeTravel`, `TransferAndLockFixedRateFacetTimeTravel`, and `TransferAndLockKpiLinkedRateFacetTimeTravel` removed — the asset time-travel contract already covers these facets; the dedicated wrappers were redundant.

  No ABI, selector, or storage layout changes.

- 7859e50: Tests: add `Deactivated` coverage for all functions guarded by `onlyActivated`.

  Every external, state-mutating function across all facets now has a corresponding test in a `describe("Deactivated")` block that verifies the call reverts with `Deactivated` after `DeactivateFacet.deactivate()` is invoked.

  Previous test files only covered the first function of each facet. The remaining functions — including paired operations such as `add`/`remove`, `grant`/`revoke`, `freeze`/`unfreeze`, and `activate`/`deactivate` — had no deactivation test. This gap is now closed across all 47 affected integration test files (85 new test cases in total).

  Additionally, `onlyActivated` was removed from `view` functions and from `initialize` functions where it had been incorrectly placed, and the modifier was added to two override functions in `ProceedRecipientsKpiLinkedRateFacet` that had not inherited it from the base contract.

## 7.0.0

### Major Changes

- 0fe41df: refactor split voting functions in a new facet
- 2502ada: split equity facet from equity facet
- add9335: split coupon from bondFacet

### Minor Changes

- 9d8d309: new asset loan
- be18d8d: Add AmortizationFacet for Loan and LoanPortfolio asset types. Amortization enables scheduling and querying factor-based principal-return payments as corporate actions. Includes AmortizationStorageWrapper, full Diamond integration, and a complete integration test suite.
- c7d4744: Factory generic method to deploy resolver proxies implemented
- 6fe8bc2: BLR now checks that business logics keys corresponds to the key returned by the corresponding introspection method of the business logic address when registering new facets. This double check reduces the chances of an admin setting by mistake the wrong address for a facet.

### Patch Changes

- 052272a: Tests updated to use a single asset interface for all facets
- 777e272: Some minor changes were made in a couple os smart contracts in order to reduce redundant code.

## 6.0.0

### Major Changes

- 5e58601: Add cancelCorporateAction and rename the calls, commands and queries from dividends to dividend when set or return one

### Minor Changes

- 2e5fdcf: - Added `balancesOfAtSnapshot` query to retrieve holder balances at specific snapshots with pagination support.
- 9d56586: Restructure contracts folder layout for DDD alignment:
  - Reorganize `layer_0/` into `domain/` with `core/` and `asset/` split, drop `Lib` prefix from all domain files
  - Move `layer_1/`, `layer_2/`, `layer_3/` under `facets/` directory
  - Build `infrastructure/` from `resolver/` and `proxies/` with `diamond/`, `proxy/`, and `utils/` subdirectories
  - Consolidate all scattered `constants/` into root `constants/` directory
  - Move `mocks/` and test-only contracts into `test/mocks/`
  - Colocate all interfaces next to their implementations (remove centralized `interfaces/` directories)
  - Rename plural feature folders to singular (`snapshots/` → `snapshot/`, `nonces/` → `nonce/`, etc.)

- 8b538ed: Refactor nominal value in a new facet

### Patch Changes

- f809d77: Fix downstream project compatibility for contracts package:
  - Convert 454 bare `contracts/` prefix imports to relative imports across 250 Solidity files; relative imports work universally across Hardhat, Foundry, and downstream consumers
  - Reorganize test utilities into dedicated files (`helpers/assertions.ts`, `fixtures/hardhatHelpers.ts`) and expose via new `./test/fixtures` export entry point for downstream test reuse
  - Add `isDeployable` field to `ContractMetadata` in registry generator to correctly distinguish deployable contracts from interfaces/libraries; only deployable mocks generate TypeChain factory references
  - Include test helpers and fixtures in published package build output (`tsconfig.build.json`)
  - Re-enable `use-natspec` solhint rule

## 5.0.0

### Patch Changes

- f809d77: Fix downstream project compatibility for contracts package:
  - Convert 454 bare `contracts/` prefix imports to relative imports across 250 Solidity files; relative imports work universally across Hardhat, Foundry, and downstream consumers
  - Reorganize test utilities into dedicated files (`helpers/assertions.ts`, `fixtures/hardhatHelpers.ts`) and expose via new `./test/fixtures` export entry point for downstream test reuse
  - Add `isDeployable` field to `ContractMetadata` in registry generator to correctly distinguish deployable contracts from interfaces/libraries; only deployable mocks generate TypeChain factory references
  - Include test helpers and fixtures in published package build output (`tsconfig.build.json`)
  - Re-enable `use-natspec` solhint rule

## 4.3.0

### Minor Changes

- 5de99bd: Move SecurityFacet to layer_2

## 4.2.0

### Minor Changes

- c5b2a50: Add support for multiple bond types (Variable Rate, Fixed Rate, KPI Linked, SPT)

  This release introduces comprehensive support for multiple bond asset types across the Asset Tokenization Studio:

  **Breaking Changes:**
  - Refactored Solidity contracts to check for Equity type instead of Bond type, as Bond is no longer a single type but a family of types (Variable Rate, Fixed Rate, KPI Linked Rate, SPT Rate)
  - Updated asset type filtering logic to use enum values (BOND_VARIABLE_RATE, BOND_FIXED_RATE, BOND_KPI_LINKED_RATE, BOND_SPT_RATE, EQUITY) instead of display strings

  **Contract Changes:**
  - Updated LifeCycleCashFlowStorageWrapper.sol to invert AssetType checks: now validates if asset is Equity (special case) with bond types as the default behavior
  - Added comprehensive test coverage for all bond types in lifecycle cash flow tests

  **SDK Changes:**
  - Extended asset type system to support four distinct bond types plus equity
  - Maintained backward compatibility for existing integrations

  This is a **minor** version bump as it adds new functionality (multiple bond types) while maintaining backward compatibility through the enum-based approach.

- a942765: Migrate totalSupply and balances to ERC20 storage with lazy migration strategy

  This PR introduces a storage migration that moves `totalSupply` and `balances` from the legacy ERC1410BasicStorage to the new ERC20Storage, enabling better separation of concerns and improved gas efficiency.

  **Key Changes:**
  - **New Storage Structure**: Added `totalSupply` and `balances` fields to ERC20Storage struct in ERC20StorageWrapper1
  - **Lazy Migration**: Implemented `_migrateTotalSupplyIfNeeded()` and `_migrateBalanceIfNeeded()` functions that automatically migrate values from deprecated storage on first access
  - **Migration Triggers**: `_adjustTotalSupply` and `_adjustTotalBalanceFor` call `_migrateTotalSupplyIfNeeded` and `_migrateBalanceIfNeeded` respectively, ensuring migration is triggered during balance adjustment operations
  - **Backward Compatibility**: View functions prioritize legacy storage values, falling back to new storage when legacy is empty
  - **Deprecated Fields**: Renamed `_totalSupply_` to `DEPRECATED_totalSupply` and `_balances_` to `DEPRECATED_balances` in ERC1410BasicStorage to indicate deprecation
  - **Event Emission**: Simplified Transfer event emission by replacing internal `_emitTransferEvent` wrapper with direct `emit Transfer` statements
  - **New Helper Methods**: Added `_increaseBalance`, `_reduceBalance`, `_increaseTotalSupply`, `_reduceTotalSupply`, and `_adjustTotalBalanceFor` functions
  - **Migration Test Contract**: Added MigrationFacetTest for testing the migration scenarios
  - **Integration Tests**: Added `adjustBalances` integration tests verifying that `adjustBalances` migrates `totalSupply` eagerly and that per-account balance migration is triggered lazily on the next token interaction

  **Benefits:**
  - Cleaner storage architecture with ERC20-specific data in ERC20Storage
  - Automatic, transparent migration with no disruption to existing tokens
  - Small gas savings from simplified event emission (~50-70 gas per transfer operation)

- 2a26b41: Migrate from ether 5 to ether 6

### Patch Changes

- 35fde1c: Improve test infrastructure and coverage for contracts scripts:
  - Reorganize test suite into unit/integration categories
  - Add comprehensive unit tests for registry generator, checkpoint manager, and deployment utilities
  - Refactor registry generator into modular architecture (cache/, core/, utils/)
  - Standardize CLI utilities and improve error handling
  - Fix changeset-check workflow to use dynamic base branch instead of hardcoded develop

- 33e8046: Enhance checkpoint system with step tracking, retry utilities, and CLI management
  - Centralize deployment/checkpoint path management and step definitions
  - Add retry utility with exponential backoff for transient network failures
  - Implement checkpoint schema versioning with migration support
  - Add checkpoint management CLI (list/show/delete/cleanup/reset)
  - Add failure injection testing module for reproducible recovery testing
  - Comprehensive test coverage and documentation for checkpoint system

- 04e7366: Add CI deployment testing workflow and harden CI pipeline
  - Add GitHub Actions workflow for automated deployment testing (Hardhat + Hiero Solo)
  - Extract shared build job with dependency/artifact caching to eliminate duplication
  - Migrate deployment workflow to Hiero Solo with standardized naming convention
  - Upgrade actions/checkout v4.2.2 → v5.0.0 across all workflows
  - Pin actions/cache to v4.2.3 with SHA, add timeout-minutes and concurrency controls
  - Add defaults.run.shell: bash and codecov version annotation
  - Fix facet registration: replace 195 parallel RPC calls with synchronous registry lookups
  - Wrap signer with NonceManager to prevent nonce caching issues during deployment
  - Fix ethers v6 API in diamondCutManager test (keccak256, contract address accessor)
  - Add selector conflict validation test (SelectorAlreadyRegistered error)
  - Add timing output and type-safe error handling to registry generation task

- c81bab9: Cleanup and standardize GitHub Actions workflows:
  - Adopt Hiero naming convention: `ddd-xxxx-<name>.yaml` with `ddd: [XXXX] <Name>` workflow names
  - Standardize bash syntax: `[[ ]]` double brackets, `==` comparisons, `${VAR}` braces
  - Fix `$GITHUB_OUTPUT` quoting inconsistencies in publish workflows
  - Fix `if: always()` to `if: ${{ always() }}` expression syntax
  - Remove unnecessary PR formatting triggers that wasted CI runner minutes
  - Fix assignee check for security (expression injection prevention)
  - Delete obsolete backup workflow files (fully commented-out dead code)
  - Update cross-references in README.md, ci-cd-workflows.md, and CLAUDE.md

- e378e82: - Rename test/contracts/unit to test/contracts/integration to accurately reflect test type
  - Add Mocha rootHooks and globalSetup.ts to silence script logger globally during tests
  - Fix logging.test.ts and hedera.test.ts to prevent logger state leakage between suites
- ad45d49: Fix checkpoint ID format documentation and update step counts in JSDoc comments
- fe7032f: Refactor integration test helpers to reduce boilerplate and eliminate magic numbers:
  - Add centralized test constants (TEST_DELAYS, TEST_OPTIONS.CONFIRMATIONS_INSTANT, EIP1967_SLOTS, TEST_GAS_LIMITS, TEST_INIT_VALUES)
  - Create reusable test helpers (silenceScriptLogging, createCheckpointCleanupHooks)
  - Standardize import organization across all integration tests
  - Reclassify atsRegistry.data.test.ts from integration to unit directory
  - Reduce test code duplication (~100 lines eliminated)

## 4.1.1

### Patch Changes

- Fix ATS Publish github action because Package ATS Contracts job has an out of memory error and translate to English some Spanish text in compile.ts and selector.ts

## 4.1.0

### Minor Changes

- 60f35fc: kpi linked interest rate coupons now use the kpi latest facet instead of the kpi oracle

### Patch Changes

- 5f579dc: Fix all lint issues in contracts package.
- f1bac7a: Add three-layer DCO and GPG signature enforcement via git hooks (commit-msg, pre-push) and developer onboarding script.
- 8ffc87f: Fixed all linting issues and applied code formatting across the codebase. Updated license headers in all source files to use standardized SPDX format (`// SPDX-License-Identifier: Apache-2.0`). Added automated license header validation script (`check-license.js`) that runs during pre-commit to ensure all `.sol`, `.ts`, and `.tsx` files include the required SPDX license identifier.
- bde618b: Refactor registry generator into modular architecture and migrate CLI scripts from ts-node to tsx for faster execution (~3x improvement in startup time).

## 4.0.1

### Patch Changes

- 171b22b: Fix all lint issues in contracts package.
- d1552c7: refactor(scripts): standardize CLI entry points and improve infrastructure

  **CLI Standardization:**
  - Unified CLI entry points to match workflow names (deploySystemWithNewBlr, deploySystemWithExistingBlr, upgradeConfigurations, upgradeTupProxies)
  - Created shared validation utilities in `cli/shared/` module eliminating ~100+ lines of duplicated code
  - Standardized environment variable parsing and address validation across all CLI files

  **Infrastructure Improvements:**
  - Resolved circular import issues in logging module
  - Exposed tools layer API through main scripts entry point
  - Consolidated validation utilities for better code reuse

  **Performance Fix:**
  - Fixed parallel test performance regression (8+ min → 2 min)
  - Restored dynamic imports in blrConfigurations.ts to prevent eager typechain loading
  - Added troubleshooting documentation for future reference

  **Documentation:**
  - Enhanced JSDoc documentation across infrastructure operations
  - Added troubleshooting section for parallel test performance issues
  - Updated README with CLI shared utilities documentation

## 4.0.0

### Major Changes

- 3ba32c9: Audit issues fixes: compliance with ERC1400 standard, pause bypasses removed, dividends calculations errors fixed, hold data stale data updated, duplicated CA not accepted anymore, batch freeze operations and external lists do not accept zero addresses anymore, gas optimizations
- 6950d41: Code refactor plus Coupon fixing, start and end date added. Four type of bonds exist : standard, fixed rate, kpi linked rate and sustainability performance target rate
- 8f7487a: EIP712 standard fixed. Now single name (ERC20 token name) and version (BLR version number) used for all facets methods. Nonce facet created to centralized to nonce per user management.

### Minor Changes

- 2d5495e: Increase test coverage for smart contracts by adding comprehensive tests for ERC standards (ERC1410, ERC20, ERC3643, ERC20Permit, ERC20Votes), factory components, bond and equity modules, clearing, access control, external lists, KPIs, and other functionalities. Includes fixes for test synchronization, removal of unused code, and optimization of test fixtures.
- 902fea1: Added Docusaurus and project documentation, renamed the MP package organization, and added a Claude documentation command.
- 1f51771: Centralize deployment file management and enhance for downstream consumption:

  **Bug Fixes & Refactoring:**
  - Fixed critical variable shadowing bug in filename extraction
  - Added cross-platform path handling (Unix/Windows)
  - Eliminated 240 lines of duplicated code across workflow files
  - Centralized deployment file utilities in infrastructure layer
  - Added TDD regression tests to prevent future bugs

  **New Features (Downstream Enhancement):**
  - Made `WorkflowType` fully extensible: changed from `AtsWorkflowType | (string & Record<string, never>)` to `AtsWorkflowType | string`
  - Made deployment output types fully extensible by removing generic constraint
  - Added type guards: `isSaveSuccess()`, `isSaveFailure()`, `isAtsWorkflow()`
  - Added `registerWorkflowDescriptor()` for custom workflow naming
  - Updated `generateDeploymentFilename()` with descriptor registry fallback
  - Added comprehensive downstream usage documentation to README
  - Exported `ATS_WORKFLOW_DESCRIPTORS` and new utility functions

  **Breaking Changes:**
  - `WorkflowType`: Simplified from complex intersection to clean union `AtsWorkflowType | string`
  - `SaveDeploymentOptions<T>` and `saveDeploymentOutput<T>()` now accept any type (removed `extends AnyDeploymentOutput` constraint)
  - These changes enable downstream projects to use custom workflows and output types without type assertions
  - ATS workflows maintain full type safety through literal types and default type parameters

  Enables downstream projects (like GBP) to extend ATS deployment utilities with custom workflows and output types while maintaining type safety and backward compatibility.

- b802e88: feat(contracts): add updateResolverProxyConfig operation with comprehensive tests

  Add new `updateResolverProxyConfig` operation for updating already deployed ResolverProxy configurations. Enables downstream projects to update proxy version, configuration ID, or resolver address without redeploying.

  Features:
  - Parameter-based action detection (version/config/resolver updates)
  - `getResolverProxyConfigInfo` helper for querying proxy state
  - Pre/post state verification with structured results
  - New lightweight `deployResolverProxyFixture` using composition pattern
  - 33 comprehensive tests (12 unit + 21 integration)
  - Architecture documentation in CLAUDE.md

- c7ff16f: Add comprehensive upgrade workflows for ATS configurations and infrastructure

  **New Features:**
  - Configuration upgrade workflow for ResolverProxy token contracts (Equity/Bond)
  - TUP proxy upgrade workflow for BLR and Factory infrastructure
  - CLI entry points for both upgrade patterns with environment configuration
  - Checkpoint-based resumability for failed upgrades
  - Selective configuration upgrades (equity, bond, or both)
  - Batch update support for multiple ResolverProxy tokens

  **Infrastructure Improvements:**
  - Fixed import inconsistencies (relative imports → @scripts/\* aliases)
  - Simplified checkpoint directory structure (.checkpoints/)
  - Added Zod runtime validation with helpful error messages
  - Optimized registry lookups from O(n²) to O(n) complexity
  - Enhanced CheckpointManager with nested path support
  - Added ts-node configuration for path alias resolution
  - Fixed confirmations bug in tests

  **Testing:**
  - 1,419 new test cases with comprehensive coverage
  - 33 configuration upgrade tests
  - 25 TUP upgrade tests
  - Enhanced checkpoint resumability tests
  - All 1,010 tests passing

  **Documentation:**
  - Added Scenarios 3-6 to DEVELOPER_GUIDE.md
  - Comprehensive README.md upgrade sections
  - Updated .env.sample with upgrade variables
  - Clear distinction between TUP and ResolverProxy patterns

  **Breaking Changes:** None - backward compatible

- cbcc1db: Protected Transfer and Lock methods removed from smart contracts and sdk.

### Patch Changes

- dff883d: Fix CI/CD workflow bug where Contracts package was never published to npm due to duplicate SDK publish block. The second publish step now correctly publishes Contracts instead of publishing SDK twice.
- 7f92cd7: Enable parallel test execution with tsx loader for 60-75% faster test runs
  - Add tsx (v4.21.0) for runtime TypeScript support in Mocha worker threads
  - Configure parallel test scripts with NODE_OPTIONS='--import tsx'
  - Fix circular dependency in checkpoint module imports
  - Fix DiamondCutManager test assertions to use TypeChain factories
  - Separate contract and script tests with dedicated parallel targets

- c10a8ee: Replaced the Hashgraph SDK with the Hiero Ledger SDK
- 1ecd8ee: Update timestamp format to ISO standard with filesystem-safe characters
- fa07c70: test(contracts): add comprehensive unit and integration tests for TUP upgrade operations

  Add 34 tests for TransparentUpgradeableProxy (TUP) upgrade operations:
  - 13 unit tests covering parameter validation, behavior detection, result structure, and helper functions
  - 21 integration tests covering upgrade scenarios, access control, state verification, and gas reporting
  - New TUP test fixtures using composition pattern (deployTupProxyFixture, deployTupProxyWithV2Fixture)
  - Mock contracts (MockImplementation, MockImplementationV2) with proper initialization guards and storage layout compatibility

## 3.1.0

### Minor Changes

- 1f51771: Centralize deployment file management and enhance for downstream consumption:

  **Bug Fixes & Refactoring:**
  - Fixed critical variable shadowing bug in filename extraction
  - Added cross-platform path handling (Unix/Windows)
  - Eliminated 240 lines of duplicated code across workflow files
  - Centralized deployment file utilities in infrastructure layer
  - Added TDD regression tests to prevent future bugs

  **New Features (Downstream Enhancement):**
  - Made `WorkflowType` fully extensible: changed from `AtsWorkflowType | (string & Record<string, never>)` to `AtsWorkflowType | string`
  - Made deployment output types fully extensible by removing generic constraint
  - Added type guards: `isSaveSuccess()`, `isSaveFailure()`, `isAtsWorkflow()`
  - Added `registerWorkflowDescriptor()` for custom workflow naming
  - Updated `generateDeploymentFilename()` with descriptor registry fallback
  - Added comprehensive downstream usage documentation to README
  - Exported `ATS_WORKFLOW_DESCRIPTORS` and new utility functions

  **Breaking Changes:**
  - `WorkflowType`: Simplified from complex intersection to clean union `AtsWorkflowType | string`
  - `SaveDeploymentOptions<T>` and `saveDeploymentOutput<T>()` now accept any type (removed `extends AnyDeploymentOutput` constraint)
  - These changes enable downstream projects to use custom workflows and output types without type assertions
  - ATS workflows maintain full type safety through literal types and default type parameters

  Enables downstream projects (like GBP) to extend ATS deployment utilities with custom workflows and output types while maintaining type safety and backward compatibility.

- b802e88: feat(contracts): add updateResolverProxyConfig operation with comprehensive tests

  Add new `updateResolverProxyConfig` operation for updating already deployed ResolverProxy configurations. Enables downstream projects to update proxy version, configuration ID, or resolver address without redeploying.

  Features:
  - Parameter-based action detection (version/config/resolver updates)
  - `getResolverProxyConfigInfo` helper for querying proxy state
  - Pre/post state verification with structured results
  - New lightweight `deployResolverProxyFixture` using composition pattern
  - 33 comprehensive tests (12 unit + 21 integration)
  - Architecture documentation in CLAUDE.md

- c7ff16f: Add comprehensive upgrade workflows for ATS configurations and infrastructure

  **New Features:**
  - Configuration upgrade workflow for ResolverProxy token contracts (Equity/Bond)
  - TUP proxy upgrade workflow for BLR and Factory infrastructure
  - CLI entry points for both upgrade patterns with environment configuration
  - Checkpoint-based resumability for failed upgrades
  - Selective configuration upgrades (equity, bond, or both)
  - Batch update support for multiple ResolverProxy tokens

  **Infrastructure Improvements:**
  - Fixed import inconsistencies (relative imports → @scripts/\* aliases)
  - Simplified checkpoint directory structure (.checkpoints/)
  - Added Zod runtime validation with helpful error messages
  - Optimized registry lookups from O(n²) to O(n) complexity
  - Enhanced CheckpointManager with nested path support
  - Added ts-node configuration for path alias resolution
  - Fixed confirmations bug in tests

  **Testing:**
  - 1,419 new test cases with comprehensive coverage
  - 33 configuration upgrade tests
  - 25 TUP upgrade tests
  - Enhanced checkpoint resumability tests
  - All 1,010 tests passing

  **Documentation:**
  - Added Scenarios 3-6 to DEVELOPER_GUIDE.md
  - Comprehensive README.md upgrade sections
  - Updated .env.sample with upgrade variables
  - Clear distinction between TUP and ResolverProxy patterns

  **Breaking Changes:** None - backward compatible

### Patch Changes

- 7f92cd7: Enable parallel test execution with tsx loader for 60-75% faster test runs
  - Add tsx (v4.21.0) for runtime TypeScript support in Mocha worker threads
  - Configure parallel test scripts with NODE_OPTIONS='--import tsx'
  - Fix circular dependency in checkpoint module imports
  - Fix DiamondCutManager test assertions to use TypeChain factories
  - Separate contract and script tests with dedicated parallel targets

- 1ecd8ee: Update timestamp format to ISO standard with filesystem-safe characters
- fa07c70: test(contracts): add comprehensive unit and integration tests for TUP upgrade operations

  Add 34 tests for TransparentUpgradeableProxy (TUP) upgrade operations:
  - 13 unit tests covering parameter validation, behavior detection, result structure, and helper functions
  - 21 integration tests covering upgrade scenarios, access control, state verification, and gas reporting
  - New TUP test fixtures using composition pattern (deployTupProxyFixture, deployTupProxyWithV2Fixture)
  - Mock contracts (MockImplementation, MockImplementationV2) with proper initialization guards and storage layout compatibility

## 3.0.0

### Minor Changes

- e0a3f03: Add bytes operationData to ClearingOperationApproved event in case of creating a new hold to send the holdId or to be used by other operation in the future

### Patch Changes

- e0a3f03: fix: CI workflow improvements for reliable releases
  1. **Fixed --ignore pattern in ats.release.yml**: Changed from non-existent
     `@hashgraph/mass-payout*` to correct `@mass-payout/*` package namespace
  2. **Simplified publish trigger in ats.publish.yml**: Changed from
     `release: published` to `push.tags` for automatic publishing on tag push
     (no need to manually create GitHub release)
  3. **Removed recursive publish scripts**: Removed `"publish": "npm publish"`
     from contracts and SDK package.json files that caused npm to recursively
     call itself during publish lifecycle, resulting in 403 errors in CI

- e0a3f03: Lock and Clearing operations now trigger account balance snapshots. Frozen balance at snapshots methods created

## 2.0.0

### Major Changes

- c62eb6e: **BREAKING:** Nominal value decimals added to Bonds and Equities

  Nominal value decimals must now be provided when deploying new Bonds/Equities and must be retrieved when reading the nominal value. This change ensures consistent decimal handling across the platform.

### Minor Changes

- c62eb6e: Refactor deployment scripts into modular infrastructure/domain architecture with framework-agnostic provider pattern and automated registry generation

  **Breaking Changes:**
  - Deployment scripts API changed: operations now require `DeploymentProvider` parameter
  - Import paths changed to `@scripts/infrastructure` and `@scripts/domain` aliases
  - Removed legacy command/query/result patterns and monolithic scripts
  - Scripts reorganized: infrastructure/ (generic, reusable) and domain/ (ATS-specific)

  **Architecture:**
  - Infrastructure/Domain Separation with DeploymentProvider interface
  - Provider implementations for Hardhat and Standalone Node.js
  - Modular operations and workflow compositions

  **Registry System Enhancements:**
  - Automated generation with event/error deduplication
  - Expanded metadata: 49 facets, 2 infrastructure contracts, 29 storage wrappers, 28 unique roles
  - Zero warnings with TimeTravelFacet correctly excluded

  **Performance:**
  - Full build: 43.5s → 45.3s (+1.8s, 4% overhead)
  - Net code reduction: 2,947 lines across 175 files

- c62eb6e: Export missing utilities and enhance deployment tracking

  Exported utilities: Hedera integration, deployment file management, verification, selector generation, transparent proxy deployment, and bond token deployment from factory. Enhanced deployment workflows with better tracking for BLR implementation and explicit contract IDs.

- c62eb6e: Full redeem at maturity method added to bond lifecycle management

- c62eb6e: Bond and Equity storage layout updated to avoid breaking changes and maintain consistency with previous versions

- c62eb6e: Dividend Amount For methods added for equity dividend calculations

- c62eb6e: Coupon Amount For and Principal For methods added for bond payment calculations

### Patch Changes

- c62eb6e: Optimize test fixture deployment speed (96% improvement). Improved contract test performance from 47 seconds to 2 seconds per fixture by fixing inefficient batch processing and removing unnecessary network delays

- c62eb6e: Fix clean imports from /scripts path with Hardhat compatibility. Added `typesVersions` field for legacy TypeScript compatibility and missing runtime dependencies (`tslib` and `dotenv`)

- c62eb6e: Update DEVELOPER_GUIDE.md with current architecture and comprehensive script documentation

- c62eb6e: Fix base implementation in TotalBalanceStorageWrapper

## 1.17.1

### Patch Changes

- Update publishing workflows to enable non production with provenance publishing

## 1.17.0

### Minor Changes

- a36b1c8: Integrate Changesets for version management and implement enterprise-grade release workflow

  #### Changesets Integration
  - Add Changesets configuration with fixed versioning for ATS packages (contracts, SDK, dapp)
  - Configure develop-branch strategy as base for version management
  - Add comprehensive changeset management scripts: create, version, publish, status, snapshot
  - Implement automated semantic versioning and changelog generation
  - Add @changesets/cli dependency for modern monorepo version management

  #### Enterprise Release Workflow
  - Implement new ats.publish.yml workflow focused exclusively on contracts and SDK packages
  - Add manual trigger with dry-run capability for safe testing before actual releases
  - Configure parallel execution of contracts and SDK publishing jobs for improved performance
  - Support automatic triggers on version tags, release branches, and GitHub releases
  - Add changeset validation workflow to enforce one changeset per PR requirement
  - Include bypass labels for non-feature changes (no-changeset, docs-only, hotfix, chore)

  #### Repository Configuration
  - Update .gitignore to properly track .github/ workflows while excluding build artifacts
  - Remove deprecated all.publish.yml workflow in favor of focused ATS publishing
  - Update package.json with complete changeset workflow scripts and release commands
  - Enhance documentation with new version management workflow and enterprise practices

  #### Benefits
  - **Modern Version Management**: Semantic versioning with automated changelog generation
  - **Enterprise Compliance**: Manual release control with proper audit trails
  - **Parallel Publishing**: Improved CI/CD performance with independent job execution
  - **Developer Experience**: Simplified workflow with comprehensive documentation
  - **Quality Assurance**: Mandatory changeset validation ensures all changes are documented

  This establishes a production-ready, enterprise-grade release management system that follows modern monorepo practices while maintaining backward compatibility with existing development workflows.

### Patch Changes

- No autoexecute extract methods script
- Remove duplicate logs in deploy script
