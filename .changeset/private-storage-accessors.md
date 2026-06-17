---
"@hashgraph/asset-tokenization-contracts": major
---

Tighten every `*Storage()` slot accessor across all 27 `*StorageWrapper` libraries from `internal` to `private`, so facets and other libraries can no longer bypass the public library API and reach into storage directly. No ABI or storage-layout change.

Breaking: any contract or library that called a `*Storage()` accessor on a wrapper it does not own no longer compiles and must use that wrapper's dedicated `internal` read/write helper instead (e.g. `ERC3643StorageWrapper.getCompliance()` rather than `.erc3643Storage().compliance`).
