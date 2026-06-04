---
name: ats-style-guide
description: "Trigger: /ats-style-guide. Review .sol files for ATS coding convention violations. Checks staged/unstaged changes; if none, asks for a commit hash or branch. Reports violations as a fichero:línea | motivo table."
---

# ATS Style Guide Review

## Orchestrator contract — HARD BOUNDARIES

The orchestrator does **exactly three things**:

1. **Determine the git command string** from user input — text parsing only, no tools.
2. **Spawn one subagent**, passing that command string + the Rules Reference.
3. **Render the table** the subagent returns.

The orchestrator **MUST NOT**:

- Call `Bash` for any git or file command
- Call `Read` on any diff or `.sol` file
- Inspect, summarise, or relay diff content

All file I/O lives in the subagent. If the orchestrator never calls `Bash` or `Read`,
it is structurally impossible for diff content to enter its context.

---

## Step 1 — Build the git command string (no tools)

Choose the right command based on user input:

**Default** (staged + unstaged, no user input):

```
REPO=$(git rev-parse --show-toplevel); { git -C "$REPO" diff HEAD --diff-filter=d -- '*.sol'; git -C "$REPO" diff --cached HEAD --diff-filter=d -- '*.sol'; }
```

**User provides `<branch> <base>`** (fork-point diff):

```
REPO=$(git rev-parse --show-toplevel); git -C "$REPO" diff --diff-filter=d $(git -C "$REPO" merge-base <branch> <base>)...<branch> -- '*.sol'
```

**User provides only a branch** — ask before building the command:

> What is the base branch for `<branch>`? (e.g. `main`, `develop`, `feat/other-branch`)

**User provides a commit hash**:

```
REPO=$(git rev-parse --show-toplevel); git -C "$REPO" diff --diff-filter=d <hash>^..<hash> -- '*.sol'
```

---

## Step 2 — Spawn ONE subagent

Pass the **git command string** (built in Step 1) and the **Rules Reference** below.
Do not pass diff content, file paths, or line counts — the subagent determines all of that.

**Subagent instructions** (copy verbatim into the agent prompt, substituting `<GIT_CMD>`):

---

**STEP A — Build the diff.** Run the following command and pipe through the awk filter, saving to `/tmp/ats-style-review.diff`:

```bash
{ <GIT_CMD>; } | awk '
/^\+\+\+ b\// {
  path = substr($0, 7)
  in_contracts = (path ~ /packages\/ats\/contracts\/contracts\//) &&
                 (path !~ /\/test\/|\/artifacts\/|\/build\/|\/cache\/|\/typechain-types\//)
}
in_contracts { print }
' > /tmp/ats-style-review.diff
```

Then check the line count:

```bash
wc -l < /tmp/ats-style-review.diff
```

- If **0 lines**: return exactly: `✅ No .sol changes found in packages/ats/contracts/contracts/.`
- If **> 8000 lines**: return exactly: `⚠️ Diff too large (N lines). Narrow the scope.`
- Otherwise: continue to STEP B.

**STEP B — Run solhint on the changed files only.** Extract the file paths from the diff and lint only those:

```bash
CHANGED=$(grep '^+++ b/' /tmp/ats-style-review.diff | sed 's|^+++ b/||')
cd $(git rev-parse --show-toplevel) && npx solhint --config packages/ats/contracts/solhint.config.js $CHANGED 2>&1
```

- If there are solhint violations, collect them as a `LINTING` section to prepend in the output, format:
  `contracts/path/File.sol:LINE | SOLHINT — <rule>: <message>`
- If solhint is clean, continue silently.

**STEP C — Read the diff** and proceed with manual review.

Review the diff for violations **only on added lines** — lines starting with `+`
(never `+++` file header lines).

Use `@@` hunk headers to track the actual line number on the new-file side
(the second number in `+M,N`). Count forward from that base for each `+` or
context line; report the line number of the offending `+` line.

Apply every rule in the Rules Reference below. Report ALL violations found.
Return ONLY the raw table rows (no headers, no summary, no extra text), one row
per violation, in the format:

`contracts/path/File.sol:LINE | Rule ID — explanation of the violation`

Use paths relative to `packages/ats/contracts/` (starting with `contracts/`).

---

## Step 3 — Render output

If the subagent returned a `LINTING` section, render it first:

```
### Solhint
| Fichero:Línea | Motivo |
|---|---|
<LINTING rows>
```

Then render the manual review rows:

```
### Manual review
| Fichero:Línea | Motivo |
|---|---|
<manual rows>
```

If the subagent returns the ✅ or ⚠️ sentinel, relay it directly.
If both sections are empty, output:

> ✅ No se encontraron violaciones en los ficheros revisados.

---

## Rules Reference

### AUTOMATED — detectable by reading the source text

**ATS-EVM-001** `msg.sender` used directly.

- Pattern: `msg.sender` in any expression that is NOT inside `EvmAccessors.sol`
  itself and NOT in a NatSpec comment.
- Fix: replace with `EvmAccessors.getMsgSender()`.

**ATS-EVM-002** `block.timestamp` used directly.

- Pattern: `block.timestamp` outside of NatSpec comments and outside
  `TimeTravelStorageWrapper.sol` itself.
- Fix: replace with `TimeTravelStorageWrapper.getBlockTimestamp()`.

**ATS-ERR-001** `require()` with a string message.

- Pattern: `require(` followed by a string literal argument.
- Fix: replace with a custom error and `revert`.

**ATS-IMP-001** Bare import (no named symbols).

- Pattern: `import "` or `import '` without `{`.
- Fix: use named imports: `import { X } from "..."`.

**ATS-GAS-001** Post-increment `i++` in a loop counter context.

- Pattern: `i++` or `j++` (any single-letter counter) inside a `for` or
  `while` body where the return value of the expression is discarded.
- Fix: use `++i` inside an `unchecked {}` block at the end of the loop body.

**ATS-GAS-002** Loop without `unchecked` counter increment.

- Pattern: a `for` loop whose increment is `++i` or `i++` and is NOT wrapped
  in `unchecked {}`.
- Fix: move the counter increment to `unchecked { ++i; }` at the end of the
  body and remove it from the `for` header.

**ATS-FUNC-001** `memory` used for a reference-type parameter in an `external`
function (when `calldata` is possible).

- Pattern: `external` function with a parameter declared as `[] memory` or
  `struct … memory` (not a return variable).
- Fix: change to `calldata`.

**ATS-PRIV-001** StorageWrapper accessor not `private`.

- Pattern: in a `library …StorageWrapper`, a function whose name matches
  `*Storage()` and whose visibility is `internal` instead of `private`.
- Fix: change to `private`.

**ATS-NAME-001** Function parameter missing `_` prefix.

- Pattern: `external`, `public`, or `internal` function with a parameter name
  that does NOT start with `_` (excluding `this`, unnamed params `uint256`,
  and overridden OpenZeppelin functions that must match parent signatures).
- Fix: add `_` prefix to the parameter name.

**ATS-NAME-002** Named return variable missing `_` suffix.

- Pattern: `returns (type name)` where `name` does NOT end with `_`.
- Fix: add `_` suffix.

**ATS-NAME-003** `internal` library function with `_` prefix.

- Pattern: inside a `library` body, a `function` with `internal` visibility
  whose name starts with `_`, unless the entire library consistently uses `_`
  on all its `internal` functions as an explicit bytecode-vs-DELEGATECALL signal.
- Rationale: library `internal` functions are inlined into the caller's bytecode
  and form the library's composable API — `_` implies hidden implementation detail,
  which they are not. Exception: a library mixing `internal` (inlined) and
  `external` (DELEGATECALL) functions may adopt `_` on all its `internal` functions
  to make the call-type distinction explicit. Must be applied consistently — never mixed.
- Fix: remove the `_` prefix from all `internal` function names and update call sites,
  or adopt it consistently across all `internal` functions in the library.

**ATS-SUFFIX-001** `XxxFacet` contract does not inherit `IStaticFunctionSelectors`.

- Pattern: `contract …Facet` declaration whose `is` list does not include
  `IStaticFunctionSelectors`.
- Fix: add `IStaticFunctionSelectors` to the inheritance list.

**ATS-IFACE-001** Interface declared without `I` prefix.

- Pattern: `interface` keyword followed by a name that does NOT start with `I`
  (e.g. `interface Cap`, `interface AccessControl`).
- Fix: rename to `IXxx` and update all references.

**ATS-STORAGE-001** Storage struct missing `@custom:storage-location erc7201:` annotation.

- Pattern: a `struct` whose name ends in `DataStorage` (or `Storage` in legacy
  files) declared in a `…StorageWrapper.sol` that is NOT immediately preceded
  by a NatSpec block containing `@custom:storage-location erc7201:`.
- Fix: add the annotation above the struct declaration.

**ATS-EVENT-001** Numeric amount indexed in an event.

- Pattern: an `event` declaration that contains `uint256 indexed` (or any
  `uintN indexed` / `int256 indexed`) for a parameter that represents a
  quantity or amount rather than an identifier.
- Rationale: indexing amounts wastes bloom-filter slots and is almost never
  used for filtering; only addresses and natural keys (e.g. `bytes32 role`)
  should be indexed.
- Fix: remove `indexed` from the numeric parameter.

**ATS-EVENT-002** Event parameter has `_` prefix.

- Pattern: an `event` declaration with a parameter name that starts with `_`
  (e.g. `event Paused(address indexed _operator)`).
- Rationale: event parameters use clean names without leading `_`. The ABI/topic
  hash depends on types only — not names — so this rename is non-breaking.
  Follows OpenZeppelin convention (`Transfer(address indexed from, ...)`).
- Fix: remove the `_` prefix from the event parameter name and its `@param` tag.

**ATS-FACET-001** State variable declared inside a Facet or business-logic abstract.

- Pattern: a non-`constant` / non-`immutable` state variable declaration in a
  file whose contract name ends in `Facet`, or in an abstract contract that
  sits in `facets/<name>/` and is not a `…Modifiers` or `…Base` file.
- Rationale: all state must live in storage structs accessed via
  `StorageWrapper` libraries — this is the core MAF invariant.
- Fix: move the state to the appropriate `XxxDataStorage` struct and access it
  through the StorageWrapper.

**ATS-LINT-001** `solhint-disable` comment added.

- Severity: WARNING — always flag, never block.
- Pattern: any line containing `// solhint-disable` (inline or block form).
- Review guidance: there are very few legitimate uses in this codebase.
  Known acceptable cases:
  - `// solhint-disable-next-line no-inline-assembly` immediately before the
    `assembly { s_.slot := position }` block inside a StorageWrapper accessor.
    Outside these known cases, the disable comment is a smell — ask: _Is there
    a refactor that removes the need for it?_
- When reporting, include the exact disable directive and the surrounding
  context (what rule is being suppressed and why).

**ATS-SEL-001** Ascending selector registration in `getStaticFunctionSelectors`.

- Pattern: inside a `getStaticFunctionSelectors` function body, an ascending counter
  such as `selectors[i++]`, `selectors[selectorIndex++]`, or any `i++`/`++i`
  in the `for` header rather than the descending `unchecked { r[--i] = ...; }` pattern.
- Fix: rewrite using the descending pattern:
  `uint256 i = N; r = new bytes4[](i); unchecked { r[--i] = this.fn.selector; ... }`

**ATS-BOUND-001** Forbidden import from `factory/ERC3643/`.

- Pattern: an `import` statement in any file whose path contains
  `contracts/constants/`, `contracts/domain/`, `contracts/facets/layer_1-2/`,
  or whose filename is `Factory.sol`, that references `factory/ERC3643/`.
- Fix: place shared types at a neutral location; the T-REX side re-exports or keeps its own copy.

### CONTEXTUAL — require reading and understanding the code

**ATS-ARCH-001** Thin wrapper function.

- A function whose entire body is a single call to another function with the
  same arguments and no additional logic, guard, or event.
- Fix: delete the wrapper; callers invoke the underlying function directly.

**ATS-ARCH-002** `initializeXxx` wrapper in a StorageWrapper.

- A `library …StorageWrapper` that contains a function named `initializeXxx`
  whose body only assigns values to the storage struct — a setter already
  exists (or should exist) for this purpose.
- Fix: expose only the setter; have the external facet initializer call the
  setter directly.

**ATS-ARCH-003** Event emitted inside a StorageWrapper or Ops library.

- An `emit` statement inside a `library` body.
- Fix: move the emit to the outermost business-logic layer (the abstract
  contract of the facet), unless the library function is called from multiple
  callers with no shared outer layer.

**ATS-STYLE-001** Storage struct named `XxxStorage` instead of `XxxDataStorage`.

- A `struct` whose name ends with `Storage` but not `DataStorage`, declared
  inside a `…StorageWrapper` file.
- Severity: WARNING (deuda técnica — do not auto-fix, flag only).

**ATS-STYLE-002** Business-logic layer is `contract` instead of `abstract contract`.

- A file in `facets/<name>/` (not `…Facet.sol`) that declares `contract`
  instead of `abstract contract`.
- Severity: WARNING (deuda técnica).

**ATS-ARCH-004** `using X for Y` declared in a concrete facet or business-logic abstract.

- A `using` statement inside a `contract` (not abstract) or an abstract in
  `facets/<name>/` that is not a `…Modifiers` file and not an infrastructure
  proxy contract.
- `using` is permitted only in: `library …StorageWrapper`, `abstract contract
…Modifiers`, and infrastructure proxy contracts under `infrastructure/`.
- Fix: move the `using` declaration to the appropriate StorageWrapper library
  or Modifiers abstract; have the facet layer call the library function
  directly.

**ATS-INIT-001** External `initializeXxx` function missing `InitializerStorageWrapper.setFacetToReady` call.

- An `external` function whose name starts with `initialize` that does NOT
  contain a call to `InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_…)`.
- Rationale: every facet initializer must mark itself as ready in the
  InitializerStorageWrapper so the Diamond resolver can track registration.
- Fix: add `InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_XXX);`
  after the setter calls and before the emitted event.

**ATS-STORAGE-002** Storage struct missing 5-region layout.

- A `struct` in a `*StorageWrapper.sol` that does not follow the 5-region layout with
  all region banner comments present (even when a region is empty):
  R1 Lifecycle bools, R2 Packed scalars, R3 Single-slot scalars, R4 Aggregates, APPEND-ONLY ZONE.
- Fix: reorganise fields into the 5 regions and add all five banner comments.

**ATS-INIT-002** Initializer uses inline guard instead of `onlyNot<Feature>Initialized` modifier.

- An `external` function whose name starts with `initialize` that calls
  `_checkNotInitialized(...)` or any equivalent inline guard expression, instead of
  applying an `onlyNot<Feature>Initialized` modifier at the function signature.
- Fix: extract the guard into a dedicated `onlyNot<Feature>Initialized` modifier and apply it.

**ATS-EVENT-003** State-changing external function emits no event.

- An `external` non-`view`/non-`pure` function that writes to storage and contains
  no `emit` statement anywhere in its execution path.
- Fix: declare and emit a dedicated event for the state change on the writer interface.

**ATS-EVENT-004** Event declared on a shared types interface.

- An `event` declaration inside an `I*Types.sol` file.
- Fix: move the event to the writer interface (`I<Feature>.sol`) of the facet that emits it.

**ATS-EVENT-005** Initializer does not emit a `<Feature>Initialized` event.

- An `external` `initializeXxx` function that does not emit an event whose name ends
  in `Initialized` and carries the initialised field values.
- Fix: declare `event <Feature>Initialized(...)` on the writer interface and emit it.

**ATS-TYPE-001** Type placement violation.

- A `struct` or `enum` used by exactly one facet declared in a shared `I*Types.sol`
  (should be inline on that facet's interface); or a type used by 2+ facets declared
  inline on a single facet interface (should be in a shared `I*Types.sol`).
- Fix: move to the correct location based on usage count.

**ATS-TYPE-002** Custom error outside the reverting facet's interface.

- A custom `error` declared in a file that is not the interface of the facet that
  reverts with it, and not `ICommonErrors` (for cross-domain errors).
- Fix: move the error to the writer interface of the facet that uses it, or to `ICommonErrors`.

**ATS-NATSPEC-001** Missing NatSpec on `private` or `internal` callable.

- A `private` or `internal` function, modifier, or constructor with no NatSpec block
  (neither `/** */` block nor `///` line tags). Solhint `use-natspec` only warns on
  `external`/`public` — this rule covers the unreported gap.
- Fix: add at minimum a `@notice` line describing intent and a `@dev` line covering
  preconditions or implementation constraints.
