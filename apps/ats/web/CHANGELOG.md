# @hashgraph/asset-tokenization-dapp

## 9.0.0

### Patch Changes

- @hashgraph/asset-tokenization-sdk@9.0.0

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

- e4c323c: Stop pinning the equity / bond creation flow to `configVersion = 0` by default
  and resolve the latest registered configuration version explicitly through the
  SDK before submission.
  - New `resolveConfigVersion(envVersion, configurationId)` helper in
    `apps/ats/web/src/utils/configVersion.ts`. When the env var parses to an
    integer `>= 1`, it returns that explicit pin; otherwise it calls
    `SDKService.resolveLatestConfigVersion`, which now wraps the SDK's
    `Management.resolveLatestConfigVersion` query, and returns the resolved
    number.
  - The resolve runs inside the `useCreateEquity` / `useCreateBond` mutation
    functions, so it is covered by React Query's `isLoading` (the submit button
    stays disabled during the on-chain lookup, preventing double-submits) and by
    the existing `onError` toast (a failed resolve surfaces the standard error
    toast instead of silently swallowing the rejection). The legacy
    `parseInt(env ?? "0")` fallback in `StepReview` is removed.
  - `REACT_APP_EQUITY_CONFIG_VERSION` and `REACT_APP_BOND_CONFIG_VERSION`
    default to an empty string in `.env` / `.env.example`, documented inline:
    empty = auto-resolve, integer `>= 1` = explicit pin.

  This is the final layer of the BBND-1775 series (contracts → SDK → web). It
  pairs with the contract-side `VersionZero` revert and the SDK-side
  `MIN_CONFIG_VERSION` validation introduced in the earlier PRs.

### Patch Changes

- 545cab0: Fix HederaWalletConnect reconnection and disconnect flow
  - Upgrade `@reown/appkit` (and related packages) from 1.8.10 to 1.8.19 to resolve SVG rendering errors in the modal and the `adapterType` undefined crash when creating AppKit after a disconnect
  - Add a 500 ms wait after AppKit is first created so that its background `initialize()` task (which calls `unSyncExistingConnection → ModalController.close`) completes before the pairing modal is opened — this prevents the modal from being immediately closed on the first connect attempt
  - Wrap `createAppKit` in a try/catch that clears all adapter singletons on failure so that a subsequent connect attempt retries from a clean state instead of hitting `NotInitialized`
  - Replace the inline `reset() + window.location.reload()` in the Header disconnect button with a proper call to `SDKService.disconnectWallet()` (via `useSDKDisconnectFromMetamask`) so the WalletConnect session is cleanly terminated and navigation back to the landing page is handled by the router, without a full page reload
  - Remove leftover debug `console.log` from the `walletDisconnect` event handler

- Updated dependencies:
  - @hashgraph/asset-tokenization-sdk@8.0.0

## 7.0.0

### Patch Changes

- 2b68e6c: Fix HederaWalletConnect reconnection and disconnect flow
  - Upgrade `@reown/appkit` (and related packages) from 1.8.10 to 1.8.19 to resolve SVG rendering errors in the modal and the `adapterType` undefined crash when creating AppKit after a disconnect
  - Add a 500 ms wait after AppKit is first created so that its background `initialize()` task (which calls `unSyncExistingConnection → ModalController.close`) completes before the pairing modal is opened — this prevents the modal from being immediately closed on the first connect attempt
  - Wrap `createAppKit` in a try/catch that clears all adapter singletons on failure so that a subsequent connect attempt retries from a clean state instead of hitting `NotInitialized`
  - Replace the inline `reset() + window.location.reload()` in the Header disconnect button with a proper call to `SDKService.disconnectWallet()` (via `useSDKDisconnectFromMetamask`) so the WalletConnect session is cleanly terminated and navigation back to the landing page is handled by the router, without a full page reload
  - Remove leftover debug `console.log` from the `walletDisconnect` event handler

- Updated dependencies:
  - @hashgraph/asset-tokenization-sdk@7.0.0

## 6.0.0

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

- 3048bbf: Enable docusarus documentation deployments with Netlify and fix ats web deployment build
- Updated dependencies:
  - @hashgraph/asset-tokenization-sdk@6.0.0

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
  - @hashgraph/asset-tokenization-sdk@5.0.0

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

- 9ef7139: Add loading overlay in security's details page and a fill form button in create security page
- Updated dependencies:
  - @hashgraph/asset-tokenization-sdk@4.3.0

## 4.2.0

### Patch Changes

- 9f22ba7: Fix select all roles in edit roles page
- Updated dependencies:
  - @hashgraph/asset-tokenization-sdk@4.2.0

## 4.1.1

### Patch Changes

- @hashgraph/asset-tokenization-sdk@4.1.1

## 4.1.0

### Patch Changes

- 8ffc87f: Fixed all linting issues and applied code formatting across the codebase. Updated license headers in all source files to use standardized SPDX format (`// SPDX-License-Identifier: Apache-2.0`). Added automated license header validation script (`check-license.js`) that runs during pre-commit to ensure all `.sol`, `.ts`, and `.tsx` files include the required SPDX license identifier.
- Updated dependencies:
  - @hashgraph/asset-tokenization-sdk@4.1.0

## 4.0.1

### Patch Changes

- @hashgraph/asset-tokenization-sdk@4.0.1

## 4.0.0

### Major Changes

- 6950d41: Code refactor plus Coupon fixing, start and end date added. Four type of bonds exist : standard, fixed rate, kpi linked rate and sustainability performance target rate

### Minor Changes

- 902fea1: Added Docusaurus and project documentation, renamed the MP package organization, and added a Claude documentation command.

### Patch Changes

- Updated dependencies:
  - @hashgraph/asset-tokenization-sdk@4.0.0

## 3.1.0

### Patch Changes

- @hashgraph/asset-tokenization-sdk@3.1.0

## 3.0.0

### Minor Changes

- e0a3f03: Add getCouponAmountFor info (numerator, denominator, recordDateReached) to see coupon view
- e0a3f03: [ATS-SDK] Add tokenBalance and decimals to getCouponFor and [ATS-WEB] add fullRedeem in forceRedeem view and balance in seeCoupons and seeDividend views
- e0a3f03: Add a checkbox in force redeem view to redeem every tokens if the maturity date has arrived
- e0a3f03: Add getDividendAmountFor info (numerator, denominator, recordDateReached) in see dividend view

### Patch Changes

- Updated dependencies:
  - @hashgraph/asset-tokenization-sdk@3.0.0

## 2.0.0

### Major Changes

- c62eb6e: **BREAKING:** Nominal value decimals integration

  Web application now displays and requires nominal value decimals for all Bond and Equity operations. UI components updated to handle decimal precision consistently across all asset views.

### Minor Changes

- c62eb6e: Dividend Amount For display added to see dividend view with calculation details (numerator, denominator, recordDateReached)

- c62eb6e: Coupon Amount For and Principal For display added to bond views with full calculation breakdown

### Patch Changes

- c62eb6e: Add decimal precision display to nominal value in bonds and equity views

- Updated dependencies:
  - @hashgraph/asset-tokenization-sdk@2.0.0

## 1.17.1

### Patch Changes

- Update publishing workflows to enable non production with provenance publishing

## 1.17.0

### Minor Changes

- a36b1c8: Integrate Changesets for version management and a manual-control release workflow.
  - Add Changesets with fixed versioning for the ATS packages (contracts, SDK, dapp) on a develop-branch base, plus create/version/publish/status/snapshot scripts for automated semantic versioning and changelog generation.
  - Add the `ats.publish.yml` workflow (contracts + SDK) with a dry-run manual trigger, parallel publish jobs, and automatic triggers on version tags, release branches and GitHub releases.
  - Add changeset validation enforcing one changeset per PR, with bypass labels (no-changeset, docs-only, hotfix, chore).
  - Track `.github/` workflows in `.gitignore`, remove the deprecated `all.publish.yml`, and update `package.json` release scripts.

### Patch Changes

- Display proceed recipients' data in text format in ats web
- Updated dependencies:
  - @hashgraph/asset-tokenization-sdk@1.17.0
