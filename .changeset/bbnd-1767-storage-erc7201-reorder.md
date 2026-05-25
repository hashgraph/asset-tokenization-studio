---
"@hashgraph/asset-tokenization-contracts": major
---

Adopt full ERC-7201 namespaced storage discipline across `packages/ats/contracts/`. Closes the loop on the slot-formula work landed in BBND-1674.

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
