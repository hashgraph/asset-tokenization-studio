# Storage Struct Layout

All persistent state lives in ERC-7201 namespaced structs declared inside `…StorageWrapper`
libraries. Facets and business-logic abstracts never declare state variables
(see [architecture.md](architecture.md) ATS-FACET-001).

### ATS-STORAGE-001 — Storage struct missing `@custom:storage-location erc7201:` annotation

- Severity: ERROR
- Enforcement: AUTOMATED
- Pattern: a `struct` whose name ends in `DataStorage` (or `Storage` in legacy files) declared
  in a `…StorageWrapper.sol` that is NOT immediately preceded by a NatSpec block containing
  `@custom:storage-location erc7201:`.
- Fix: add the annotation above the struct declaration, as the last tag inside the struct's
  NatSpec block (see [code-quality.md](code-quality.md) § NatSpec for placement details).

### ATS-STORAGE-002 — Storage struct missing 5-region layout

- Severity: ERROR
- Enforcement: MANUAL
- Pattern: a `struct` in a `*StorageWrapper.sol` that does not follow the 5-region layout with
  all region banner comments present (even when a region is empty):
  1. R1 — Lifecycle bools
  2. R2 — Packed scalars
  3. R3 — Single-slot scalars
  4. R4 — Aggregates
  5. APPEND-ONLY ZONE
- Rationale: a fixed region order keeps slot packing predictable and makes upgrade-safe
  (append-only) evolution auditable.
- Fix: reorganise fields into the 5 regions and add all five banner comments.

### ATS-STYLE-001 — Storage struct named `XxxStorage` instead of `XxxDataStorage`

- Severity: WARNING
- Enforcement: MANUAL
- Pattern: a `struct` whose name ends with `Storage` but not `DataStorage`, declared inside a
  `…StorageWrapper` file.
- Rationale: technical debt being phased out — flag only, do not auto-fix.

### ATS-PRIV-001 — StorageWrapper accessor not `private`

- Severity: ERROR
- Enforcement: AUTOMATED
- Pattern: in a `library …StorageWrapper`, a function whose name matches `*Storage()` and whose
  visibility is `internal` instead of `private`.
- Fix: change to `private`.
