# Storage Struct Layout

All persistent state lives in ERC-7201 namespaced structs declared inside `…StorageWrapper`
libraries. Facets and business-logic abstracts never declare state variables
(see [architecture.md](architecture.md) ATS-FACET-001).

## Layout & annotation

### ATS-STORAGE-001 — Storage struct missing `@custom:storage-location erc7201:` annotation

- Enforced by `solhint-plugin-ats/rules/storage-struct-erc7201.js`.
- A `…DataStorage` layout reused across several ERC-7201 namespaces (instantiated by a
  slot-parameterised accessor, e.g. `externalListStorage(bytes32 _position)`) has no single real
  namespace. Annotate it with the `@custom:storage-location erc7201:multiple` sentinel and list the
  real bindings (one `STORAGE_LOCATION_*` constant per namespace) in the struct's `@dev` block.

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

## Naming

### ATS-STYLE-001 — Storage struct named `XxxStorage` instead of `XxxDataStorage`

- Severity: WARNING
- Enforcement: MANUAL
- Pattern: a `struct` whose name ends with `Storage` but not `DataStorage`, declared inside a
  `…StorageWrapper` file.
- Rationale: technical debt being phased out — flag only, do not auto-fix.

## Accessors

### ATS-PRIV-001 — StorageWrapper accessor not `private`

- Enforced by `solhint-plugin-ats/rules/storage-accessor-private.js`.
- Targets only the canonical accessor: a `*Storage` function taking no parameters and returning a
  `storage` reference (the fixed-slot namespace accessor). Initialisers (which take parameters and
  return nothing) and slot-parameterised accessors such as `fooStorage(bytes32 _position)` (reused
  cross-library, so necessarily `internal`) are out of scope.
