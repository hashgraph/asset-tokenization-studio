# @hashgraph/asset-tokenization-sdk

## 9.0.0

### Patch Changes

- Updated dependencies [93cbfc8]
- Updated dependencies [fa2f462]
- Updated dependencies [6945eb5]
- Updated dependencies [0f4bfa1]
- Updated dependencies [da8bd72]
- Updated dependencies [2a24712]
- Updated dependencies [dd29415]
- Updated dependencies [9a7fecd]
- Updated dependencies [656f903]
- Updated dependencies [16ea27d]
- Updated dependencies [760f475]
- Updated dependencies [85ac8d2]
- Updated dependencies [7444da6]
- Updated dependencies [3e96613]
- Updated dependencies [9900cd2]
- Updated dependencies [766422f]
- Updated dependencies [7bf12b8]
- Updated dependencies [37a4f32]
- Updated dependencies [64e8681]
- Updated dependencies [9e56b43]
- Updated dependencies [001cb25]
- Updated dependencies [f4ca6b0]
- Updated dependencies [c06db90]
- Updated dependencies [eb6d462]
- Updated dependencies [9fee020]
- Updated dependencies [61a7fcc]
- Updated dependencies [f5e9915]
- Updated dependencies [5c0caa9]
- Updated dependencies [2dcfaa1]
- Updated dependencies [a8d246d]
- Updated dependencies [12d4a25]
- Updated dependencies [4d4309b]
  - @hashgraph/asset-tokenization-contracts@9.0.0

## 8.0.0

### Major Changes

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
  - EIP-712 typehashes are unchanged — same typedef text, solc folding identical.
  - SDK `SecurityRole` enum keeps its member names; only the hex literals are updated.

  Incidental fix: `LOAN_CORPORATE_ACTION_TYPE` was a hand-rolled value, not a real keccak. Codegen now emits the correct `CORPORATE_ACTION_TYPE_LOAN` hash.

### Minor Changes

- 3703219: Implemented all methods from the AmortizationFacet in the SDK.
- 8b4258b: Add `nominalValueCurrency` (ISO 4217 `bytes3`) to the `NominalValue` facet. Extends `initializeNominalValue` to accept the currency and adds `setNominalValueCurrency` / `getNominalValueCurrency` external functions, plus the matching SDK command, query, request DTOs, and adapter wiring. Factory forwards `bondDetails.currency` / `equityDetails.currency` on new deploys. Renames `initialize_NominalValue` to `initializeNominalValue` (camelCase, drops the solhint disable). [BBND-1730]
- 24ee150: Require explicit non-zero configuration versions across the SDK and expose a
  helper for resolving the latest registered version.
  - Adds `Management.resolveLatestConfigVersion({ resolverAddress, configurationId })`,
    backed by `ResolveLatestConfigVersionQuery` and a new
    `RPCQueryAdapter.getLatestVersionByConfiguration(resolverAddress, configurationId)`
    call into the diamond cut manager.
  - Tightens validation on every request that carries a `configVersion`
    (`CreateEquityRequest`, `CreateBondRequest`, `CreateBondFixedRateRequest`,
    `CreateBondKpiLinkedRateRequest`, `CreateTrexSuiteEquityRequest`,
    `CreateTrexSuiteBondRequest`, `UpdateConfigVersionRequest`,
    `UpdateConfigRequest`, `UpdateResolverRequest`) to reject values below
    `MIN_CONFIG_VERSION` (1), surfaced via a new shared constant in
    `@core/Constants`.
  - Updates `CreateEquity` / `CreateBond` / `CreateBondFixedRate` /
    `CreateBondKpiLinkedRate` / `CreateTrexSuiteEquity` / `CreateTrexSuiteBond`
    command handlers to reject both `undefined` and `< 1` with a message
    pointing callers at the new resolver query.

  Migration: callers that previously relied on `configVersion: 0` to track the
  latest configuration must now call
  `Management.resolveLatestConfigVersion(...)` first and pass the resolved
  number explicitly. Pairs with the contract-side
  `VersionZero(configurationId)` revert introduced in the contracts PR.

- 33ae16a: Added `deactivate` command and `isDeactivated` query to the SDK.

  The `deactivate` command triggers the irreversible deactivation of a security token, requiring the caller to hold `DEACTIVATE_ROLE` and the token to be unpaused. The `isDeactivated` query reads the current deactivation state of a security. Both operations are exposed through the `Security` port via the new `SecurityInPortDeactivation` mixin.

- 63e3f5c: Use IAsset in SDK for every SC call and change actionTypeId* and actionTypeIndex* to actionIdByType\_ in CorporateActions
- 206b234: Added `setMetadata` command and `getMetadata` query to the SDK, enabling callers to write and read arbitrary key/value metadata on a security token.
- f76e0de: rename isPaused to paused fucntion in Pause Facet and rename Pause events and errors without Token word
- 96f0781: Remove the permissionless T-REX suite deployment surface from the factory and SDK.

  Contracts: removed `deployTREXSuiteAtsEquity` and `deployTREXSuiteAtsBond` from `TREXFactory`, along with the `TokenDetailsAts` struct and associated imports. Deleted the now-unreachable deployment libraries: `TREXEquityDeploymentLib`, `TREXBondDeploymentLib`, `core/TREXBaseDeploymentLib`, and `core/SecurityDeploymentLib`. Updated `Configuration.ts` (empty `LIBRARY_NAMES`) and the deployment task so `TREXFactoryAts` is deployed without external libraries. Removed the write-only `atsFactory` storage, its `setAtsFactory` setter, and the constructor's `_atsFactory` argument. The factory contract itself, its remaining setters, `recoverContractOwnership`, and `getToken` are preserved.

  SDK: removed the `createTrexSuite` feature end-to-end — bond/equity commands, handlers, requests, the `getTokenBySalt` query, the `TRexFactory` domain context, the `InvalidTrexTokenSalt` error, and `InjectableTrexFactory`. Cleaned up the transaction/query adapters (HS and RPC), `TransactionAdapter`, `ValidationService` (`checkTrexTokenSaltExists`), `TransactionService`, the handlers registry, and the `TREX_CREATE_SUITE` gas constant.

- e407034: Add nominal value support to the SDK: new commands and queries wrapping the NominalValueFacet so dapp consumers can set and read nominal values on equity and bond tokens. Contracts-side facet already shipped in contracts 6.0.0 (commit 8b538ed).

### Patch Changes

- 6ea0fb0: Retire four classes of deprecated storage from the contracts package and ship the long-term resolution of the deferred Tier 4 cleanup.

  Storage retirements: the orphaned ERC20Permit storage slot and its struct; the bond/equity nominal-value migration shim and its test facet; the ERC1410-to-ERC20 totalSupply/balances migration shim and its test facet; and the trailing deprecated name/version/nonces fields on ProtectedPartitions and ERC20Votes. Re-slots BondDataStorage, EquityDataStorage, ERC1410BasicStorage, and ERC20VotesStorage — greenfield deployment required.

  ScheduledTasksOps orchestrator: new external library following the same pattern as HoldOps and TokenCoreOps. Nine production callers (KpiLinkedRate, ProceedRecipients facets, ERC1410StorageWrapper, ERC20VotesStorageWrapper, NominalValueStorageWrapper) now DELEGATECALL into the standalone library instead of the legacy self-CALL helper, saving roughly 2000 gas per invocation. Removes callTriggerPendingScheduledCrossOrderedTasks from ScheduledTasksStorageWrapper. Pause-guard preserved at the orchestrator boundary so Burn / Transfer / ERC1594 / BurnByPartition facets keep their cascading IsPaused revert semantics.

- 545cab0: Fix HederaWalletConnect reconnection and disconnect flow
  - Upgrade `@reown/appkit` (and related packages) from 1.8.10 to 1.8.19 to resolve SVG rendering errors in the modal and the `adapterType` undefined crash when creating AppKit after a disconnect
  - Add a 500 ms wait after AppKit is first created so that its background `initialize()` task (which calls `unSyncExistingConnection → ModalController.close`) completes before the pairing modal is opened — this prevents the modal from being immediately closed on the first connect attempt
  - Wrap `createAppKit` in a try/catch that clears all adapter singletons on failure so that a subsequent connect attempt retries from a clean state instead of hitting `NotInitialized`
  - Replace the inline `reset() + window.location.reload()` in the Header disconnect button with a proper call to `SDKService.disconnectWallet()` (via `useSDKDisconnectFromMetamask`) so the WalletConnect session is cleanly terminated and navigation back to the landing page is handled by the router, without a full page reload
  - Remove leftover debug `console.log` from the `walletDisconnect` event handler

- f2979e5: - Add `BalanceTrackerFacet` with `balanceOf` and `totalSupply` methods, consolidating balance-read logic into a dedicated facet with `_BALANCE_TRACKER_RESOLVER_KEY`.
  - Remove `balanceOf` and `totalSupply` from `ERC1410ReadFacet`.
  - SDK `RPCQueryAdapter` updated to call `balanceOf` and `totalSupply` via `IAsset`.
- 308289b: Split a new Burn Facet. ERC3643OperationsFacet is empty so is deleted
- f2979e5: - Add `DocumentationFacet` with `setDocument`, `removeDocument`, `getDocument` and `getAllDocuments`, registering document-management selectors under the new `_DOCUMENTATION_RESOLVER_KEY`.
  - Remove `ERC1643Facet`, `ERC1643`, `IERC1643`, `ERC1643FacetTimeTravel`, `_ERC1643_RESOLVER_KEY` and `_ERC1643_STORAGE_POSITION`.
  - `IAsset` updated to inherit `IDocumentation` instead of `IERC1643`; selectors and ABI are unchanged.
  - SDK adapters (`RPCQueryAdapter`, `RPCTransactionAdapter`, `SecurityMetadataOperations`) updated to connect via `IAsset__factory` instead of `ERC1643Facet__factory`.
- 841a069: Migrated all voting operations in the SDK from `Equity__factory` to the new `VotingFacet__factory`, aligning with the contract refactor that split voting logic into a dedicated `VotingFacet`. Updated mass-payout contracts to import `IVoting` for voting structs/methods and `ICoupon` for coupon holders, and updated the backend adapter and tests to use `CouponToken` instead of `BondToken` for `getAllCoupons` and `getTotalCouponHolders`.
- Updated dependencies:
  - @hashgraph/asset-tokenization-contracts@8.0.0

## 7.0.0

### Major Changes

- add9335: Migrated all coupon operations from `BondToken` to a new dedicated `CouponToken` export, replacing `BondRead__factory` and `Bond__factory` with `Coupon__factory` across all coupon queries and transactions. Added new `getCouponsFor` method for paginated coupon balances per account.

### Minor Changes

- 4431f2e: Implemented all methods from the AmortizationFacet in the SDK.
- ca1807d: Add nominal value support to the SDK: new commands and queries wrapping the NominalValueFacet so dapp consumers can set and read nominal values on equity and bond tokens. Contracts-side facet already shipped in contracts 6.0.0 (commit 8b538ed).

### Patch Changes

- 2b68e6c: Fix HederaWalletConnect reconnection and disconnect flow
  - Upgrade `@reown/appkit` (and related packages) from 1.8.10 to 1.8.19 to resolve SVG rendering errors in the modal and the `adapterType` undefined crash when creating AppKit after a disconnect
  - Add a 500 ms wait after AppKit is first created so that its background `initialize()` task (which calls `unSyncExistingConnection → ModalController.close`) completes before the pairing modal is opened — this prevents the modal from being immediately closed on the first connect attempt
  - Wrap `createAppKit` in a try/catch that clears all adapter singletons on failure so that a subsequent connect attempt retries from a clean state instead of hitting `NotInitialized`
  - Replace the inline `reset() + window.location.reload()` in the Header disconnect button with a proper call to `SDKService.disconnectWallet()` (via `useSDKDisconnectFromMetamask`) so the WalletConnect session is cleanly terminated and navigation back to the landing page is handled by the router, without a full page reload
  - Remove leftover debug `console.log` from the `walletDisconnect` event handler

- a166566: Migrated all voting operations in the SDK from `Equity__factory` to the new `VotingFacet__factory`, aligning with the contract refactor that split voting logic into a dedicated `VotingFacet`. Updated mass-payout contracts to import `IVoting` for voting structs/methods and `ICoupon` for coupon holders, and updated the backend adapter and tests to use `CouponToken` instead of `BondToken` for `getAllCoupons` and `getTotalCouponHolders`.
- Updated dependencies:
  - @hashgraph/asset-tokenization-contracts@7.0.0

## 6.0.0

### Major Changes

- 5e58601: Add cancelCorporateAction and rename the calls, commands and queries from dividends to dividend when set or return one
- 77aa333: Migrate to HWC 2

### Minor Changes

- 77aa333: Implement comprehensive bond tokenization SDK with KPI-linked rates and coupon management:
  - Add CreateBondFixedRate and CreateBondKpiLinkedRate commands for bond creation
  - Implement setInterestRate, setRate, getRate, and getInterestRate for rate management
  - Add KPI data infrastructure: addKpiData, getLatestKpiData, getMinDate, getIsCheckPointDate, setImpactData
  - Implement coupon management: getCouponsOrdered, GetCouponFromOrderedListAt, getOrderedLiistTotal
  - Add scheduled coupon distribution: GetScheduledCouponListing, getScheduledCouponListingCount
  - Enhance RPC and Hedera transaction adapters for bond operations

- 2e5fdcf: - Added `balancesOfAtSnapshot` query to retrieve holder balances at specific snapshots with pagination support.

### Patch Changes

- 77aa333: Fix failing tests in web app and SDK:
  - Mock ESM-only packages (@hashgraph/hedera-wallet-connect, @reown/appkit) in web jest config to resolve CJS/ESM incompatibility
  - Fix HederaWalletConnectTransactionAdapter unit test: use jest.spyOn for read-only rpcProvider property
  - Update environmentMock paths for custodial adapters (hs/hts/custodial → hs/custodial) following file restructure
  - Remove mocks for deleted HederaTransactionAdapter and abstract CustodialTransactionAdapter
  - Add register() and createBond() mocks to DFNS, Fireblocks, and AWSKMS custodial adapter mocks
  - Grant \_KPI_MANAGER_ROLE to bond creator in createBond mock to enable addKpiData tests

- 3048bbf: Enable docusarus documentation deployments with Netlify and fix ats web deployment build
- Updated dependencies:
  - @hashgraph/asset-tokenization-contracts@6.0.0

## 5.0.0

### Major Changes

- 77aa333: Migrate to HWC 2

### Minor Changes

- 77aa333: Implement comprehensive bond tokenization SDK with KPI-linked rates and coupon management:
  - Add CreateBondFixedRate and CreateBondKpiLinkedRate commands for bond creation
  - Implement setInterestRate, setRate, getRate, and getInterestRate for rate management
  - Add KPI data infrastructure: addKpiData, getLatestKpiData, getMinDate, getIsCheckPointDate, setImpactData
  - Implement coupon management: getCouponsOrdered, GetCouponFromOrderedListAt, getOrderedLiistTotal
  - Add scheduled coupon distribution: GetScheduledCouponListing, getScheduledCouponListingCount
  - Enhance RPC and Hedera transaction adapters for bond operations

### Patch Changes

- 77aa333: Fix failing tests in web app and SDK:
  - Mock ESM-only packages (@hashgraph/hedera-wallet-connect, @reown/appkit) in web jest config to resolve CJS/ESM incompatibility
  - Fix HederaWalletConnectTransactionAdapter unit test: use jest.spyOn for read-only rpcProvider property
  - Update environmentMock paths for custodial adapters (hs/hts/custodial → hs/custodial) following file restructure
  - Remove mocks for deleted HederaTransactionAdapter and abstract CustodialTransactionAdapter
  - Add register() and createBond() mocks to DFNS, Fireblocks, and AWSKMS custodial adapter mocks
  - Grant \_KPI_MANAGER_ROLE to bond creator in createBond mock to enable addKpiData tests

- Updated dependencies:
  - @hashgraph/asset-tokenization-contracts@5.0.0

## 4.3.0

### Minor Changes

- 5ba3560: Implement comprehensive bond tokenization SDK with KPI-linked rates and coupon management:
  - Add CreateBondFixedRate and CreateBondKpiLinkedRate commands for bond creation
  - Implement setInterestRate, setRate, getRate, and getInterestRate for rate management
  - Add KPI data infrastructure: addKpiData, getLatestKpiData, getMinDate, getIsCheckPointDate, setImpactData
  - Implement coupon management: getCouponsOrdered, GetCouponFromOrderedListAt, getOrderedLiistTotal
  - Add scheduled coupon distribution: GetScheduledCouponListing, getScheduledCouponListingCount
  - Enhance RPC and Hedera transaction adapters for bond operations

### Patch Changes

- Updated dependencies:
  - @hashgraph/asset-tokenization-contracts@4.3.0

## 4.2.0

### Minor Changes

- c5b2a50: Add support for multiple bond types (Variable Rate, Fixed Rate, KPI Linked, SPT). Refactored Solidity contracts to check for Equity type instead of Bond type, as Bond is no longer a single type but a family of types (BOND_VARIABLE_RATE, BOND_FIXED_RATE, BOND_KPI_LINKED_RATE, BOND_SPT_RATE, EQUITY). Updated LifeCycleCashFlowStorageWrapper.sol to invert AssetType checks: now validates if asset is Equity (special case) with bond types as the default behaviour. Extended asset type system in the SDK to support four distinct bond types plus equity; backward compatibility maintained through the enum-based approach.
- 2a26b41: Migrate from ether 5 to ether 6

### Patch Changes

- Updated dependencies:
  - @hashgraph/asset-tokenization-contracts@4.2.0

## 4.1.1

### Patch Changes

- Updated dependencies:
  - @hashgraph/asset-tokenization-contracts@4.1.1

## 4.1.0

### Patch Changes

- 8ffc87f: Fixed all linting issues and applied code formatting across the codebase. Updated license headers in all source files to use standardised SPDX format (`// SPDX-License-Identifier: Apache-2.0`). Added automated license header validation script (`check-license.js`) that runs during pre-commit to ensure all `.sol`, `.ts`, and `.tsx` files include the required SPDX license identifier.
- Updated dependencies:
  - @hashgraph/asset-tokenization-contracts@4.1.0

## 4.0.1

### Patch Changes

- Updated dependencies:
  - @hashgraph/asset-tokenization-contracts@4.0.1

## 4.0.0

### Major Changes

- 3ba32c9: Audit issues fixes: compliance with ERC1400 standard, pause bypasses removed, dividends calculations errors fixed, hold data stale data updated, duplicated CA not accepted anymore, batch freeze operations and external lists do not accept zero addresses anymore, gas optimizations
- 6950d41: Code refactor plus Coupon fixing, start and end date added. Four type of bonds exist : standard, fixed rate, kpi linked rate and sustainability performance target rate

### Minor Changes

- 902fea1: Added Docusaurus and project documentation, renamed the MP package organisation, and added a Claude documentation command.
- 8f7487a: EIP712 standard fixed. Now single name (ERC20 token name) and version (BLR version number) used for all facets methods. Nonce facet created to centralized to nonce per user management.
- cbcc1db: Protected Transfer and Lock methods removed from smart contracts and sdk.

### Patch Changes

- 650874b: Set `collectCoverage` to `false` by default and enable it only in CI
- c10a8ee: Replaced the Hashgraph SDK with the Hiero Ledger SDK
- Updated dependencies:
  - @hashgraph/asset-tokenization-contracts@4.0.0

## 3.1.0

### Patch Changes

- Updated dependencies:
  - @hashgraph/asset-tokenization-contracts@3.1.0

## 3.0.0

### Major Changes

- e0a3f03: [ATS-SDK] Add tokenBalance and decimals to getCouponFor and [ATS-WEB] add fullRedeem in forceRedeem view and balance in seeCoupons and seeDividend views

### Patch Changes

- e0a3f03: fix: CI workflow improvements for reliable releases — fixed `--ignore` pattern in `ats.release.yml` (changed from non-existent `@hashgraph/mass-payout*` to correct `@mass-payout/*`); simplified publish trigger in `ats.publish.yml` to `push.tags` for automatic publishing on tag push; removed recursive `"publish": "npm publish"` scripts from contracts and SDK `package.json` files that caused 403 errors in CI.
- e0a3f03: Add a checkbox in force redeem view to redeem every tokens if the maturity date has arrived
- Updated dependencies:
  - @hashgraph/asset-tokenization-contracts@3.0.0

## 2.0.0

### Major Changes

- c62eb6e: **BREAKING:** Nominal value decimals support

  SDK now requires and returns nominal value decimals when working with Bonds and Equities. Update all integration code to handle the new decimal field for consistent value representation.

### Minor Changes

- c62eb6e: Full redeem at maturity functionality added to bond lifecycle operations

- c62eb6e: Dividend Amount For calculation methods added for equity dividend management

- c62eb6e: Coupon Amount For and Principal For calculation methods added for bond payment management

### Patch Changes

- Updated dependencies:
  - @hashgraph/asset-tokenization-contracts@2.0.0

## 1.17.1

### Patch Changes

- Update publishing workflows to enable non production with provenance publishing

## 1.17.0

### Minor Changes

- a36b1c8: Integrate Changesets for version management and implement enterprise-grade release workflow.
  - Add Changesets configuration with fixed versioning for ATS packages (contracts, SDK, dapp) and develop-branch strategy as base
  - Add changeset management scripts: create, version, publish, status, snapshot; add `@changesets/cli` dependency
  - Implement `ats.publish.yml` workflow with manual dry-run trigger, parallel contracts/SDK publishing jobs, and support for version tags, release branches, and GitHub releases
  - Add changeset validation workflow enforcing one changeset per PR; bypass labels: `no-changeset`, `docs-only`, `hotfix`, `chore`
  - Update `.gitignore` to track `.github/` workflows while excluding build artefacts; remove deprecated `all.publish.yml`
  - Update `package.json` with complete changeset workflow scripts and release commands

### Patch Changes

- Updated dependencies:
  - @hashgraph/asset-tokenization-contracts@1.17.0
- Replace proceedRecipientIds for proceedRecipientsIds
