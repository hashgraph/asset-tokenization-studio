# Naming Conventions

Naming rules for identifiers and artifact types: underscore affixes, the guard/predicate
taxonomy, and cardinality (singular vs plural). Anything not covered here defaults to the
official Solidity style guide (see [README](README.md)).

## Identifier affixes & guard naming

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

### ATS-NAME-006 — `private` StorageWrapper accessor without `_` prefix

- Enforced by `solhint-plugin-ats/rules/storage-accessor-underscore.js`.
- Complements [ATS-NAME-003](#ats-name-003--internal-library-function-with-_-prefix): `internal`
  library functions carry no `_`; the `private` slot accessor carries one.

### ATS-IFACE-001 — Interface declared without `I` prefix

- Enforced by solhint built-in `interface-starts-with-i`.

## Cardinality (singular vs plural)

Not covered by the official Solidity style guide — it specifies casing but is silent on
plurality. These two rules fill that gap: a name must reflect how many things it holds.

### ATS-NAME-007 — Array identifier with a singular name (or scalar with a plural name)

- Severity: ERROR
- Enforcement: MANUAL — deterministic from the declared type (array vs not), so a future
  `solhint-plugin-ats` rule can own it; until then the `/ats-style-guide` review checks it.
- Pattern: a declaration whose type is a dynamic or fixed array (`T[]`, `T[N]`) — including an
  array used as a `mapping` value or a struct field — carrying a grammatically singular name; or,
  conversely, a scalar (a single value: `uint256`, `address`, `bool`, a struct, an enum) carrying
  a plural name. `mapping` and `EnumerableSet` cardinality is judgment, not type — it falls to
  [ATS-NAME-008](#ats-name-008--logical-collection-not-pluralised), not here.
- Rationale: the type already states the cardinality; the name must agree with it so a reader can
  tell a list from a single value without resolving the type.
- Fix: pluralise the array name, or singularise the scalar name. Example: a
  `mapping(address => uint256[]) labafUserPartition` field holds an array per key → rename to
  `labafUserPartitions`.

### ATS-NAME-008 — Logical collection not pluralised

- Severity: WARNING
- Enforcement: MANUAL — cardinality here is semantic, not derivable from the type, so it needs
  code comprehension and stays a flag, never a block.
- Pattern: an identifier denoting a logical collection that is not a syntactic array — a `mapping`
  whose value is itself a collection, an `EnumerableSet`, or a getter returning several items —
  named in the singular; or a single-valued qualifier named in the plural. A conventional
  collection `mapping(address => uint256) balances` is correctly plural and is NOT flagged.
- Rationale: plurality should track the logical quantity a name represents, not only its syntactic
  type, so collections read as collections and qualifiers read as single.
- Fix: name by logical cardinality. Example: in `mapping(address => mapping(address => uint256))
labafsAllowances`, the `labafs` qualifier is a single LABAF context per entry → `labafAllowances`.

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
