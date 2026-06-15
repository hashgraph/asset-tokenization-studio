# Naming Conventions

Prefix/suffix rules for identifiers and artifact types.

### ATS-NAME-001 — Function parameter missing `_` prefix

- Severity: ERROR
- Enforcement: AUTOMATED
- Pattern: `external`, `public`, or `internal` function with a parameter name that does NOT
  start with `_` (excluding `this`, unnamed params such as a bare `uint256`, and overridden
  OpenZeppelin functions that must match parent signatures).
- Fix: add the `_` prefix to the parameter name.

### ATS-NAME-002 — Named return variable missing `_` suffix

- Severity: ERROR
- Enforcement: AUTOMATED
- Pattern: `returns (type name)` where `name` does NOT end with `_`.
- Fix: add the `_` suffix.

### ATS-NAME-003 — `internal` library function with `_` prefix

- Severity: ERROR
- Enforcement: AUTOMATED
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

### ATS-IFACE-001 — Interface declared without `I` prefix

- Severity: ERROR
- Enforcement: AUTOMATED
- Pattern: `interface` keyword followed by a name that does NOT start with `I` (e.g.
  `interface Cap`, `interface AccessControl`).
- Fix: rename to `IXxx` and update all references.

## Artifact-type suffixes

For reference when naming new files (violations of these surface through the rules above and
through [architecture.md](architecture.md) / [storage.md](storage.md)):

| Artifact                  | Naming pattern              | Example                      |
| ------------------------- | --------------------------- | ---------------------------- |
| Diamond facet wrapper     | `<Feature>Facet`            | `PauseFacet`                 |
| Business-logic layer      | `<Feature>` (abstract)      | `Pause`                      |
| Storage wrapper library   | `<Feature>StorageWrapper`   | `PauseStorageWrapper`        |
| Storage struct            | `<Feature>DataStorage`      | `PauseDataStorage`           |
| Writer interface          | `I<Feature>`                | `IPause`                     |
| Shared types interface    | `I<Domain>Types`            | `IBondTypes`                 |
| Modifiers abstract        | `<Feature>Modifiers`        | `PauseModifiers`             |
