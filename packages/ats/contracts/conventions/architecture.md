# Architecture — Diamond / MAF Patterns

The ATS contracts follow a Diamond (multi-facet) architecture. Facets are thin `contract`
wrappers over `abstract contract` business-logic layers; all state lives in ERC-7201 storage
structs accessed through `…StorageWrapper` libraries. These rules protect the layer boundaries.

## EVM context accessors

### ATS-EVM-001 — `msg.sender` used directly

- Enforced by `solhint-plugin-ats/rules/no-direct-msg-sender.js`.

### ATS-EVM-002 — `block.timestamp` used directly

- Enforced by `solhint-plugin-ats/rules/no-direct-block-timestamp.js`.

## Facet structure

### ATS-FACET-001 — State variable declared inside a Facet or business-logic abstract

- Severity: ERROR
- Enforcement: AUTOMATED
- Pattern: a non-`constant` / non-`immutable` state variable declaration in a file whose
  contract name ends in `Facet`, or in an abstract contract that sits in `facets/<name>/` and
  is not a `…Modifiers` or `…Base` file.
- Rationale: all state must live in storage structs accessed via `StorageWrapper` libraries —
  this is the core MAF invariant.
- Fix: move the state to the appropriate `XxxDataStorage` struct and access it through the
  StorageWrapper.

### ATS-SUFFIX-001 — `XxxFacet` contract does not inherit `IStaticFunctionSelectors`

- Enforced by `solhint-plugin-ats/rules/facet-implements-selectors.js`.

### ATS-SEL-001 — Ascending selector registration in `getStaticFunctionSelectors`

- Severity: ERROR
- Enforcement: MANUAL — the ascending-vs-descending structure needs code comprehension; the
  `i++` variant is already caught generically by solhint `gas-increment-by-one` (ATS-GAS-001).
- Pattern: inside a `getStaticFunctionSelectors` function body, an ascending counter such as
  `selectors[i++]`, `selectors[selectorIndex++]`, or any `i++`/`++i` in the `for` header rather
  than the descending `unchecked { r[--i] = ...; }` pattern.
- Fix: rewrite using the descending pattern:

  ```solidity
  uint256 i = N;
  staticFunctionSelectors_ = new bytes4[](i);
  unchecked {
      staticFunctionSelectors_[--i] = this.fn.selector;
      // ... one line per selector, descending
  }
  ```

### ATS-STYLE-002 — Business-logic layer is `contract` instead of `abstract contract`

- Severity: WARNING
- Enforcement: MANUAL
- Pattern: a file in `facets/<name>/` (not `…Facet.sol`) that declares `contract` instead of
  `abstract contract`.
- Rationale: technical debt being phased out — flag only, do not auto-fix.

## Module boundaries

### ATS-BOUND-001 — Forbidden import from `factory/ERC3643/`

- Enforced by `solhint-plugin-ats/rules/no-erc3643-import.js`.

## Prohibited patterns

### ATS-ARCH-001 — Thin wrapper function

- Severity: ERROR
- Enforcement: MANUAL
- Pattern: a function whose entire body is a single call to another function with the same
  arguments and no additional logic, guard, or event.
- Fix: delete the wrapper; callers invoke the underlying function directly.

### ATS-ARCH-002 — `initializeXxx` wrapper in a StorageWrapper

- Severity: ERROR
- Enforcement: MANUAL
- Pattern: a `library …StorageWrapper` that contains a function named `initializeXxx` whose
  body only assigns values to the storage struct — a setter already exists (or should exist)
  for this purpose.
- Fix: expose only the setter; have the external facet initializer call the setter directly.

### ATS-ARCH-003 — Event emitted inside a StorageWrapper or Ops library (retired)

- Merged into [events.md](events.md) **ATS-EVENT-006**, which owns the full emit-site doctrine
  (emit from the facet by default; the four justifications for a lower-layer emit; the hard
  no-duplication rule). Report library-body emits under ATS-EVENT-006 only — never both.

### ATS-ARCH-004 — `using X for Y` declared in a concrete facet or business-logic abstract

- Severity: ERROR
- Enforcement: MANUAL
- Pattern: a `using` statement inside a `contract` (not abstract) or an abstract in
  `facets/<name>/` that is not a `…Modifiers` file and not an infrastructure proxy contract.
- Rationale: `using` is permitted only in `library …StorageWrapper`, `abstract contract
…Modifiers`, and infrastructure proxy contracts under `infrastructure/`.
- Fix: move the `using` declaration to the appropriate StorageWrapper library or Modifiers
  abstract; have the facet layer call the library function directly.

## Facet initialization

Every facet exposes an `external initializeXxx` function. These rules keep initializers
uniform, guarded, observable, and registered with the Diamond resolver.

### ATS-INIT-001 — External `initializeXxx` missing `InitializerStorageWrapper.setFacetToReady` call

- Severity: ERROR
- Enforcement: MANUAL
- Pattern: an `external` function whose name starts with `initialize` that does NOT contain a
  call to `InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_…)`.
- Rationale: every facet initializer must mark itself as ready in the
  InitializerStorageWrapper so the Diamond resolver can track registration.
- Fix: add `InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_XXX);` after the setter
  calls and before the emitted event.

### ATS-INIT-002 — Initializer uses inline guard instead of `onlyNot<Feature>Initialized` modifier

- Severity: ERROR
- Enforcement: MANUAL
- Pattern: an `external` function whose name starts with `initialize` that calls
  `_checkNotInitialized(...)` or any equivalent inline guard expression, instead of applying an
  `onlyNot<Feature>Initialized` modifier at the function signature.
- Fix: extract the guard into a dedicated `onlyNot<Feature>Initialized` modifier and apply it.

### ATS-EVENT-005 — Initializer does not emit a `<Feature>Initialized` event

- Severity: ERROR
- Enforcement: MANUAL
- Pattern: an `external` `initializeXxx` function that does not emit an event whose name ends
  in `Initialized` and carries the initialised field values.
- Fix: declare `event <Feature>Initialized(...)` on the writer interface and emit it.

### Canonical initializer shape

```solidity
function initializePause(PauseInitData calldata _initData) external onlyNotPauseInitialized {
  PauseStorageWrapper.setPaused(_initData.paused);
  InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_PAUSE);
  emit PauseInitialized(_initData.paused);
}
```
