# Naming Conventions

Prefix/suffix rules for identifiers and artifact types.

### ATS-NAME-001 — Function parameter missing `_` prefix

- Enforced by `solhint-plugin-ats/rules/function-param-underscore.js`.

### ATS-NAME-002 — Named return variable missing `_` suffix

- Enforced by `solhint-plugin-ats/rules/named-return-underscore.js`.

### ATS-NAME-003 — `internal` library function with `_` prefix

- Severity: ERROR
- Enforcement: MANUAL
- Pattern: inside a `library` body, a `function` with `internal` visibility whose name starts
  with `_`, unless the entire library consistently uses `_` on all its `internal` functions as
  an explicit bytecode-vs-DELEGATECALL signal.
- Rationale: library `internal` functions are inlined into the caller's bytecode and form the
  library's composable API — `_` implies hidden implementation detail, which they are not.
  Exception: a library mixing `internal` (inlined) and `external` (DELEGATECALL) functions may
  adopt `_` on all its `internal` functions to make the call-type distinction explicit. Must be
  applied consistently — never mixed.
- Fix: remove the `_` prefix from all `internal` function names and update call sites, or adopt
  it consistently across all `internal` functions in the library.

### ATS-NAME-006 — `private` StorageWrapper accessor without `_` prefix

- Enforced by `solhint-plugin-ats/rules/storage-accessor-underscore.js`.
- Pattern: inside a `library …StorageWrapper`, the canonical `*Storage()` accessor (no parameters,
  returns a `storage` reference) declared `private` whose name does not start with `_`.
- Rationale: the complement of [ATS-NAME-003](#ats-name-003--internal-library-function-with-_-prefix).
  `internal` library functions are the composable API and carry no `_`; the `private` slot accessor
  is a hidden implementation detail, so the `_` prefix marks it as such and lets a reader tell the
  two apart by name alone (`_capStorage()` is private; `capStorage()` would be API).
- Fix: prefix the accessor name with `_` and update its in-library call sites (it is `private`, so
  every call site lives in the same library).

### ATS-NAME-004 — Guard and predicate naming taxonomy

- Severity: ERROR
- Enforcement: MANUAL
- Pattern: a modifier, assertion helper, or predicate whose name does not match its construct in
  the table below — most commonly a modifier prefixed with `check` (e.g. `checkValidHoldId`), an
  assertion helper not prefixed with `_check`, or a `returns (bool)` predicate prefixed with
  `only`/`check` instead of `is`/`has`.

  | Construct                | Name                               | Reverts? | Example                                  |
  | ------------------------ | ---------------------------------- | -------- | ---------------------------------------- |
  | Access / state invariant | `onlyX`                            | yes      | `onlyOperational`, `onlyAdminRole`       |
  | Input / precondition     | `onlyValidX` / `notX`              | yes      | `onlyValidHoldId`, `notZeroAddress`      |
  | Assertion helper         | `_checkX` (private/internal, void) | yes      | `_checkValidVersion`                     |
  | Non-reverting predicate  | `isX` / `hasX` (returns `bool`)    | no       | `isResolverProxyConfigurationRegistered` |

- Rationale: the name must signal whether the construct reverts and how it is meant to be used.
  Three binding rules follow from the table:
  1. `check` is a verb — it appears **only** on `_check*` helpers, never as a modifier prefix
     (enforced deterministically by [ATS-NAME-005](#ats-name-005--check-prefix-on-a-modifier)).
  2. A modifier delegates to one or more `_check*` helpers and is named for the guaranteed
     property (`onlyValidHoldId`), not for the act of checking (`checkValidHoldId`).
  3. `valid` and `validate` are not interchangeable as a **modifier** prefix: the house form is
     `onlyValid<Property>`, never `validate<Property>`. `validate` stays a verb on helper
     functions only, where the table's `_check*` form applies. (A `validate*` modifier whose
     guard duplicates an existing `onlyValid*` one is removed in favour of the existing modifier,
     not renamed.)
- Fix: rename to the construct's pattern — modifier prefixes become `only*`/`not*` (never
  `validate*`), the reverting assertion it delegates to becomes `_check*`, and a non-reverting
  `bool` accessor becomes `is*`/`has*`.

### ATS-NAME-005 — `check` prefix on a modifier

- Enforced by `solhint-plugin-ats/rules/no-check-modifier.js`.

### ATS-IFACE-001 — Interface declared without `I` prefix

- Enforced by solhint built-in `interface-starts-with-i`.

## Artifact-type suffixes

For reference when naming new files (violations of these surface through the rules above and
through [architecture.md](architecture.md) / [storage.md](storage.md)):

| Artifact                | Naming pattern            | Example               |
| ----------------------- | ------------------------- | --------------------- |
| Diamond facet wrapper   | `<Feature>Facet`          | `PauseFacet`          |
| Business-logic layer    | `<Feature>` (abstract)    | `Pause`               |
| Storage wrapper library | `<Feature>StorageWrapper` | `PauseStorageWrapper` |
| Storage struct          | `<Feature>DataStorage`    | `PauseDataStorage`    |
| Writer interface        | `I<Feature>`              | `IPause`              |
| Shared types interface  | `I<Domain>Types`          | `IBondTypes`          |
| Modifiers abstract      | `<Feature>Modifiers`      | `PauseModifiers`      |
