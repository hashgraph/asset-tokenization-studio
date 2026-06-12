# @hashgraph/asset-tokenization-sdk

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
  - EIP-712 typehashes are unchanged - same typedef text, solc folding identical.
  - SDK `SecurityRole` enum keeps its member names; only the hex literals are updated.

  Incidental fix: `LOAN_CORPORATE_ACTION_TYPE` was a hand-rolled value (`0x8f3e2a1b...0e1f`), not a real keccak. Codegen now emits the correct `CORPORATE_ACTION_TYPE_LOAN` hash.

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

  **Contracts:**
  - Removed `deployTREXSuiteAtsEquity` and `deployTREXSuiteAtsBond` from `TREXFactory`, along with the `TokenDetailsAts` struct and their associated imports.
  - Deleted the now-unreachable deployment libraries: `TREXEquityDeploymentLib`, `TREXBondDeploymentLib`, `core/TREXBaseDeploymentLib`, and `core/SecurityDeploymentLib`.
  - Updated `Configuration.ts` (empty `LIBRARY_NAMES`) and the deployment task so `TREXFactoryAts` is deployed without external libraries.
  - Removed the now write-only `atsFactory` storage, its `setAtsFactory` setter, and the constructor's `_atsFactory` argument, which only fed the deleted deployment libraries. The deployment task no longer derives or passes an ATS factory address.
  - The factory contract itself, its remaining setters, `recoverContractOwnership`, and `getToken` are preserved.

  **SDK:**
  - Removed the `createTrexSuite` feature end to end: bond/equity commands, handlers, requests, the `getTokenBySalt` query, the `TRexFactory` domain context, the `InvalidTrexTokenSalt` error, and `InjectableTrexFactory`.
  - Cleaned up the transaction/query adapters (HS and RPC), `TransactionAdapter`, `ValidationService` (`checkTrexTokenSaltExists`), `TransactionService`, the handlers registry, and the `TREX_CREATE_SUITE` gas constant.

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
- Updated dependencies [72fea42]
- Updated dependencies [ffeb27e]
- Updated dependencies [0a574c7]
- Updated dependencies [f2455d2]
- Updated dependencies [8b4258b]
- Updated dependencies [eca9fcd]
- Updated dependencies [2da0e1d]
- Updated dependencies [e5440a1]
- Updated dependencies [deb0aae]
- Updated dependencies [40fcb8a]
- Updated dependencies [8e0007f]
- Updated dependencies [849d838]
- Updated dependencies [8f7e6ce]
- Updated dependencies [cf4d8bf]
- Updated dependencies [f391ac4]
- Updated dependencies [a8053d6]
- Updated dependencies [beab0e9]
- Updated dependencies [90d5bc6]
- Updated dependencies [413a3a9]
- Updated dependencies [84c0c22]
- Updated dependencies [ccd68f4]
- Updated dependencies [6ea0fb0]
- Updated dependencies [aabf9de]
- Updated dependencies [ae981c5]
- Updated dependencies [94bbc49]
- Updated dependencies [2968ef6]
- Updated dependencies [9879296]
- Updated dependencies [c1b3835]
- Updated dependencies [78b262b]
- Updated dependencies [233ab1e]
- Updated dependencies [d1a2507]
- Updated dependencies [dee49f6]
- Updated dependencies [825568b]
- Updated dependencies [da5532a]
- Updated dependencies [d41ffd0]
- Updated dependencies [a838ad3]
- Updated dependencies [c2cae93]
- Updated dependencies [775f36e]
- Updated dependencies [7bdf045]
- Updated dependencies [1cacd76]
- Updated dependencies [fb1e020]
- Updated dependencies [5b8af28]
- Updated dependencies [8857703]
- Updated dependencies [ff38bca]
- Updated dependencies [45fdace]
- Updated dependencies [76325eb]
- Updated dependencies [9a343f4]
- Updated dependencies [521b5a4]
- Updated dependencies [54a7ce1]
- Updated dependencies [139c679]
- Updated dependencies [61026ac]
- Updated dependencies [0311554]
- Updated dependencies [6772b75]
- Updated dependencies [d132f3f]
- Updated dependencies [50cc8bd]
- Updated dependencies [5a111b9]
- Updated dependencies [f8f817d]
- Updated dependencies [5dabf42]
- Updated dependencies [91d8262]
- Updated dependencies [5d553af]
- Updated dependencies [61f7072]
- Updated dependencies [0ae44da]
- Updated dependencies [23925cf]
- Updated dependencies [98b74fa]
- Updated dependencies [e2ad209]
- Updated dependencies [7c16bef]
- Updated dependencies [f95fc0c]
- Updated dependencies [9dde45b]
- Updated dependencies [d8b6174]
- Updated dependencies [9df4f1d]
- Updated dependencies [bb12115]
- Updated dependencies [3f785d3]
- Updated dependencies [b724201]
- Updated dependencies [161bdcd]
- Updated dependencies [8f248ba]
- Updated dependencies [1d916fd]
- Updated dependencies [6eaa436]
- Updated dependencies [13dc199]
- Updated dependencies [778669c]
- Updated dependencies [9a7b97f]
- Updated dependencies [1b0f5ae]
- Updated dependencies [a034245]
- Updated dependencies [544b64d]
- Updated dependencies [8ef4709]
- Updated dependencies [cf2d0b0]
- Updated dependencies [a60f779]
- Updated dependencies [41b61a2]
- Updated dependencies [a4b1f13]
- Updated dependencies [fa68d5d]
- Updated dependencies [74568b2]
- Updated dependencies [378912b]
- Updated dependencies [e78bb17]
- Updated dependencies [7f1f5da]
- Updated dependencies [04a8704]
- Updated dependencies [5f01c28]
- Updated dependencies [63e3f5c]
- Updated dependencies [a34b1fa]
- Updated dependencies [b99b658]
- Updated dependencies [f795fe2]
- Updated dependencies [0dfb7ba]
- Updated dependencies [0a44a06]
- Updated dependencies [947d70f]
- Updated dependencies [f6dcd85]
- Updated dependencies [317b632]
- Updated dependencies [3d79ea1]
- Updated dependencies [e998857]
- Updated dependencies [f71f5bc]
- Updated dependencies [e998857]
- Updated dependencies [e998857]
- Updated dependencies [0d419a8]
- Updated dependencies [bbac906]
- Updated dependencies [2bcbc97]
- Updated dependencies [5ff68af]
- Updated dependencies [c5b8a94]
- Updated dependencies [6e12e4c]
- Updated dependencies [cc0c979]
- Updated dependencies [8ee00e5]
- Updated dependencies [32e1453]
- Updated dependencies [79c0eb1]
- Updated dependencies [f075993]
- Updated dependencies [8d54a06]
- Updated dependencies [e97d1df]
- Updated dependencies [9722c83]
- Updated dependencies [7c6d97e]
- Updated dependencies [e96952b]
- Updated dependencies [2c3f9ab]
- Updated dependencies [3b9e2f6]
- Updated dependencies [ba14b9c]
- Updated dependencies [2aef6e3]
- Updated dependencies [b065203]
- Updated dependencies [362dbfc]
- Updated dependencies [328831d]
- Updated dependencies [aca5672]
- Updated dependencies [7ee4ec9]
- Updated dependencies [d1b0667]
- Updated dependencies [fc9b444]
- Updated dependencies [ba0aaaf]
- Updated dependencies [681d5d9]
- Updated dependencies [8ec1761]
- Updated dependencies [f2979e5]
- Updated dependencies [f2979e5]
- Updated dependencies [308289b]
- Updated dependencies [f2979e5]
- Updated dependencies [2924ef0]
- Updated dependencies [f2979e5]
- Updated dependencies [f2979e5]
- Updated dependencies [560678c]
- Updated dependencies [f2979e5]
- Updated dependencies [63616b8]
- Updated dependencies [3d9ace1]
- Updated dependencies [194defd]
- Updated dependencies [b288300]
- Updated dependencies [9883669]
- Updated dependencies [727033e]
- Updated dependencies [fd6d7b4]
- Updated dependencies [f2372c5]
- Updated dependencies [7013af0]
- Updated dependencies [caaca51]
- Updated dependencies [abee626]
- Updated dependencies [3bbe0f3]
- Updated dependencies [8a474b3]
- Updated dependencies [59c2f61]
- Updated dependencies [a737023]
- Updated dependencies [ea110d7]
- Updated dependencies [612c62d]
- Updated dependencies [e14641c]
- Updated dependencies [144620e]
- Updated dependencies [49cb775]
- Updated dependencies [6c83bd8]
- Updated dependencies [8e232b0]
- Updated dependencies [5f851ba]
- Updated dependencies [9d9eac5]
- Updated dependencies [f76e0de]
- Updated dependencies [70de716]
- Updated dependencies [219207b]
- Updated dependencies [3a00654]
- Updated dependencies [20ead46]
- Updated dependencies [303c70b]
- Updated dependencies [b6fb30f]
- Updated dependencies [2d94c09]
- Updated dependencies [58b906b]
- Updated dependencies [428d229]
- Updated dependencies [1c58076]
- Updated dependencies [21ba6f8]
- Updated dependencies [26c2584]
- Updated dependencies [96f0781]
- Updated dependencies [4bbadce]
- Updated dependencies [2917e8e]
- Updated dependencies [29d7538]
- Updated dependencies [bede9bc]
- Updated dependencies [9320b3b]
- Updated dependencies [52699b9]
- Updated dependencies [cc7e1fe]
- Updated dependencies [6701c1f]
- Updated dependencies [7859e50]
- Updated dependencies [3f07cbe]
- Updated dependencies [f7370ca]
- Updated dependencies [b782fa9]
- Updated dependencies [3f20512]
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
- Updated dependencies [9d8d309]
- Updated dependencies [be18d8d]
- Updated dependencies [052272a]
- Updated dependencies [c7d4744]
- Updated dependencies [0fe41df]
- Updated dependencies [2502ada]
- Updated dependencies [777e272]
- Updated dependencies [6fe8bc2]
- Updated dependencies [add9335]
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
- Updated dependencies [2e5fdcf]
- Updated dependencies [9d56586]
- Updated dependencies [f809d77]
- Updated dependencies [5e58601]
- Updated dependencies [8b538ed]
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

- Updated dependencies [f809d77]
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

- Updated dependencies [5de99bd]
  - @hashgraph/asset-tokenization-contracts@4.3.0

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

- 2a26b41: Migrate from ether 5 to ether 6

### Patch Changes

- Updated dependencies [35fde1c]
- Updated dependencies [33e8046]
- Updated dependencies [04e7366]
- Updated dependencies [c81bab9]
- Updated dependencies [e378e82]
- Updated dependencies [ad45d49]
- Updated dependencies [c5b2a50]
- Updated dependencies [a942765]
- Updated dependencies [fe7032f]
- Updated dependencies [2a26b41]
  - @hashgraph/asset-tokenization-contracts@4.2.0

## 4.1.1

### Patch Changes

- Updated dependencies
  - @hashgraph/asset-tokenization-contracts@4.1.1

## 4.1.0

### Patch Changes

- 8ffc87f: Fixed all linting issues and applied code formatting across the codebase. Updated license headers in all source files to use standardized SPDX format (`// SPDX-License-Identifier: Apache-2.0`). Added automated license header validation script (`check-license.js`) that runs during pre-commit to ensure all `.sol`, `.ts`, and `.tsx` files include the required SPDX license identifier.
- Updated dependencies [60f35fc]
- Updated dependencies [5f579dc]
- Updated dependencies [f1bac7a]
- Updated dependencies [8ffc87f]
- Updated dependencies [bde618b]
  - @hashgraph/asset-tokenization-contracts@4.1.0

## 4.0.1

### Patch Changes

- Updated dependencies [171b22b]
- Updated dependencies [d1552c7]
  - @hashgraph/asset-tokenization-contracts@4.0.1

## 4.0.0

### Major Changes

- 3ba32c9: Audit issues fixes: compliance with ERC1400 standard, pause bypasses removed, dividends calculations errors fixed, hold data stale data updated, duplicated CA not accepted anymore, batch freeze operations and external lists do not accept zero addresses anymore, gas optimizations
- 6950d41: Code refactor plus Coupon fixing, start and end date added. Four type of bonds exist : standard, fixed rate, kpi linked rate and sustainability performance target rate

### Minor Changes

- 902fea1: Added Docusaurus and project documentation, renamed the MP package organization, and added a Claude documentation command.
- 8f7487a: EIP712 standard fixed. Now single name (ERC20 token name) and version (BLR version number) used for all facets methods. Nonce facet created to centralized to nonce per user management.
- cbcc1db: Protected Transfer and Lock methods removed from smart contracts and sdk.

### Patch Changes

- 650874b: Set `collectCoverage` to `false` by default and enable it only in CI
- c10a8ee: Replaced the Hashgraph SDK with the Hiero Ledger SDK
- Updated dependencies [3ba32c9]
- Updated dependencies [2d5495e]
- Updated dependencies [902fea1]
- Updated dependencies [1f51771]
- Updated dependencies [dff883d]
- Updated dependencies [b802e88]
- Updated dependencies [6950d41]
- Updated dependencies [7f92cd7]
- Updated dependencies [8f7487a]
- Updated dependencies [c10a8ee]
- Updated dependencies [1ecd8ee]
- Updated dependencies [fa07c70]
- Updated dependencies [c7ff16f]
- Updated dependencies [cbcc1db]
  - @hashgraph/asset-tokenization-contracts@4.0.0

## 3.1.0

### Patch Changes

- Updated dependencies [1f51771]
- Updated dependencies [b802e88]
- Updated dependencies [7f92cd7]
- Updated dependencies [1ecd8ee]
- Updated dependencies [fa07c70]
- Updated dependencies [c7ff16f]
  - @hashgraph/asset-tokenization-contracts@3.1.0

## 3.0.0

### Major Changes

- e0a3f03: [ATS-SDK] Add tokenBalance and decimals to getCouponFor and [ATS-WEB] add fullRedeem in forceRedeem view and balance in seeCoupons and seeDividend views

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

- e0a3f03: Add a checkbox in force redeem view to redeem every tokens if the maturity date has arrived
- Updated dependencies [e0a3f03]
- Updated dependencies [e0a3f03]
- Updated dependencies [e0a3f03]
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

- Updated dependencies [c62eb6e]
- Updated dependencies [c62eb6e]
- Updated dependencies [c62eb6e]
- Updated dependencies [c62eb6e]
- Updated dependencies [c62eb6e]
- Updated dependencies [c62eb6e]
- Updated dependencies [c62eb6e]
- Updated dependencies [c62eb6e]
- Updated dependencies [c62eb6e]
- Updated dependencies [c62eb6e]
  - @hashgraph/asset-tokenization-contracts@2.0.0

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

- Updated dependencies
  - @hashgraph/asset-tokenization-contracts@1.17.0
- Replace proceedRecipientIds for proceedRecipientsIds
