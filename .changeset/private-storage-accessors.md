---
"@hashgraph/asset-tokenization-contracts": major
---

refactor(contracts): tighten storage-accessor visibility from `internal` to `private` in all `*StorageWrapper` libraries.

Every `*Storage()` function (e.g. `loansPortfolioStorage()`, `holdStorage()`, `erc3643Storage()`) across all 27 `*StorageWrapper` libraries now carries `private` visibility instead of `internal`.

What changes:

- **Encapsulation**: storage slot accessors are implementation details of their host library. Marking them `private` prevents facets or other libraries from bypassing the public library API and reaching into storage directly.
- **Compilation impact**: any call-site outside its host library that previously called `FooStorageWrapper.fooStorage()` directly now fails to compile. Callers must use the dedicated `internal` read/write helpers exposed by each library (e.g. `ERC3643StorageWrapper.getCompliance()` instead of `ERC3643StorageWrapper.erc3643Storage().compliance`).
- **No ABI change**: the Diamond external interface is unaffected — storage accessor functions were never part of the on-chain ABI.
- **No storage layout change**: slot positions and `STORAGE_LOCATION_*` constants are unchanged.

Breaking changes for downstream consumers:

- Any contract or library that called a `*Storage()` accessor from a `*StorageWrapper` it does not own must be updated to use the corresponding `internal` helper instead.
