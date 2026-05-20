---
name: initialize-add
description: >
  Add a new `initializeXxx` function to any configurable facet that does not yet have one.
  Every facet with a `_RESOLVER_KEY` must register itself via `setFacetToReady` regardless
  of whether it exposes view-only or state-mutating functions.
  Creates the event and function in the interface, implements the body, and registers the
  new selector in `getStaticFunctionSelectors`.
  Trigger: when a `.sol` facet has a `_RESOLVER_KEY` in `resolverKeys.sol` but no
  `initializeXxx` function.
---

# Skill: initialize-add

Creates an `initializeXxx` function from scratch for facets that have no initialisation
entrypoint. The facet registers itself with the centralised `InitializerStorageWrapper` and
emits a standardised event. Does not touch Factory.sol or test fixtures — those are handled
by `initialize-factory`.

---

## 1. Detection — is this skill applicable?

Apply this skill when ALL of the following are true:

- The facet has no function whose name starts with `initialize`
- The facet has a corresponding `_XXX_RESOLVER_KEY` defined in
  `contracts/constants/resolverKeys.sol`

The type of external functions the facet exposes is **irrelevant** — a facet with only
`view`/`pure` functions still needs `initializeXxx` to register itself with
`InitializerStorageWrapper`. Every configurable facet must call `setFacetToReady`.

If any `initializeXxx` already exists (even with the old pattern), use `initialize-update`
instead.

If no `_RESOLVER_KEY` exists for this facet, do not proceed — ask the team to add one to
`contracts/constants/resolverKeys.sol` first.

---

## 2. Naming rules (non-negotiable)

- Function name MUST be `initializeXxx` — camelCase, no underscore separator.
- `initialize_Xxx` is **forbidden**. Never write it, never accept it from a generated diff.
- Never add `// solhint-disable-next-line func-name-mixedcase` before an `initializeXxx`
  function. If Solhint flags it, the name is wrong — fix the name, do not suppress the linter.

---

## 3. Step A — Locate the RESOLVER_KEY

Open `contracts/constants/resolverKeys.sol` and find the constant for this facet.  
Pattern: `_[FEATURE_NAME_SCREAMING_SNAKE]_RESOLVER_KEY`

Examples:

- Cap by partition → `_CAP_BY_PARTITION_RESOLVER_KEY`
- Allowance → `_ALLOWANCE_RESOLVER_KEY`
- ERC1410 → `_ERC1410_RESOLVER_KEY`

---

## 4. Step B — Define the event in the interface

In `IXxx.sol`, add the event declaration before the function declarations but **after** all
`struct` and `enum` definitions. Solhint enforces this ordering: any `event` that appears
before a `struct` or `enum` in the same interface is an error.

Correct placement:

```
struct Foo { ... }   // ← types first
enum Bar { ... }     // ← types first

event XxxInitialized(...);   // ← event AFTER all types
event OtherEvent(...);
```

The event carries **only** the function's input parameters — no `operator`. The caller can
always be retrieved from the transaction context and does not need to be indexed.

For functions with no input parameters, the event is **empty**:

```solidity
/**
 * @notice Emitted once when the [facet name] capability is initialised on a token.
 * @dev Fires exclusively from `initializeXxx`.
 */
event XxxInitialized();
```

If `initializeXxx` takes parameters, the event MUST include **all** of them in the same
order and with the same types as the function signature. No filtering — every input
parameter that affected the domain state must be observable on-chain:

```solidity
/**
 * @notice Emitted once when the [facet name] capability is initialised on a token.
 * @dev Fires exclusively from `initializeXxx` after the storage write succeeds.
 * @param param1 [Description].
 */
event XxxInitialized(
  ParamType1 param1, // no calldata/memory on event params — use the bare type
  ParamType2 param2
);
```

Structs are passed as-is — do not unpack them into individual fields:

```solidity
// ✅ correct
event XxxInitialized(SomeStruct data);

// ✗ wrong — unpacking the struct adds maintenance burden
event XxxInitialized(uint256 field1, address field2);
```

### Event naming rule

Strip `initialize` prefix, append `Initialized`:

- `initializeCapByPartition` → `CapByPartitionInitialized`
- `initializeAllowance` → `AllowanceInitialized`

---

## 5. Step C — Add the function to the interface

In `IXxx.sol`, add the function signature with NatSpec:

```solidity
/**
 * @notice Initialises the [facet name] capability on the token.
 * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
 *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
 * @param _param1 [Description].
 */
function initializeXxx(ParamType1 _param1) external;
```

For no-parameter functions:

```solidity
/**
 * @notice Initialises the [facet name] capability on the token.
 * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
 *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
 */
function initializeXxx() external;
```

---

## 6. Step D — Implement the function in the facet

### With storage to initialise

```solidity
/// @inheritdoc IXxx
function initializeXxx(
  ParamType1 _param1
) external override onlyRole(DEFAULT_ADMIN_ROLE) onlyFacetNotRegistered(_XXX_RESOLVER_KEY) {
  XxxStorageWrapper.initializeXxx(_param1);
  InitializerStorageWrapper.setFacetToReady(_XXX_RESOLVER_KEY);
  emit XxxInitialized(_param1);
}
```

### Without storage to initialise (capability registration only)

This includes facets whose only external functions are `view` or `pure`:

```solidity
/// @inheritdoc IXxx
function initializeXxx() external override onlyRole(DEFAULT_ADMIN_ROLE) onlyFacetNotRegistered(_XXX_RESOLVER_KEY) {
  InitializerStorageWrapper.setFacetToReady(_XXX_RESOLVER_KEY);
  emit XxxInitialized();
}
```

### Modifier order rule

1. `external`
2. `override`
3. `onlyRole(DEFAULT_ADMIN_ROLE)` — always first; ensures "no admin" tests can use an already-initialised asset without a fresh fixture
4. `onlyFacetNotRegistered(_XXX_RESOLVER_KEY)` — always after `onlyRole`
5. Additional business modifiers if required at initialisation time

### Required imports (adjust relative path from the facet's location)

```solidity
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { _XXX_RESOLVER_KEY } from "../../constants/resolverKeys.sol";
```

`EvmAccessors` is **not** needed — events no longer carry `operator`, so there is no
`getMsgSender()` call in the function body.

`onlyFacetNotRegistered` and `onlyRole` are already in the inheritance chain through
`Modifiers` → `CoreModifiers` → `InitializerModifiers` / `AccessControlModifiers`.
No new `is` clause needed.

---

## 7. Step E — Register the selector in `getStaticFunctionSelectors`

In the concrete facet contract (the one that inherits `IStaticFunctionSelectors`), add the
new selector. Convention: `initializeXxx` goes first.

```solidity
// Before
function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
  return Bytes4Builder.build(this.existingMethod.selector, this.anotherMethod.selector);
}

// After
function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
  return
    Bytes4Builder.build(
      this.initializeXxx.selector, // NEW — initialize first by convention
      this.existingMethod.selector,
      this.anotherMethod.selector
    );
}
```

> Omitting this step means the function is unreachable through the proxy. The deployment
> will not revert — it will silently fail when the factory tries to call `initializeXxx`.

---

## 8. Step F — Add tests

Add a dedicated `describe` block in the facet's existing integration test file.
Use the project's **GIVEN/WHEN/THEN** naming convention throughout.
Canonical reference: `test/contracts/integration/clearing.test.ts` → `describe("initializeClearing")`.

### Signers

- `deployer` / `admin` — the account with `DEFAULT_ADMIN_ROLE` (comes from the fixture)
- `nonAdmin` — any signer that has **no** `DEFAULT_ADMIN_ROLE`. Use `user3` or equivalent
  from the fixture (verify it has not been granted the role in `beforeEach`).

### Test order (canonical — always this order)

1. No `DEFAULT_ADMIN_ROLE` → `AccountHasNoRole`
2. Already initialised → `FacetAlreadyRegistered`
3. Success → event emitted

### Test 1 — no DEFAULT_ADMIN_ROLE reverts

`onlyRole` fires before `onlyFacetNotRegistered`, so a non-admin caller always gets
`AccountHasNoRole` regardless of whether the facet is already registered. Use the
standard `asset` directly — no fresh proxy needed, before or after `initialize-factory`:

```typescript
describe("initializeXxx", () => {
  it("GIVEN a caller without DEFAULT_ADMIN_ROLE WHEN initializeXxx is called THEN it reverts with AccountHasNoRole", async () => {
    await expect(asset.connect(nonAdmin).initializeXxx(/* args */))
      .to.be.revertedWithCustomError(asset, "AccountHasNoRole");
  });
```

### Test 2 — double initialisation reverts

At this stage the factory does NOT yet call `initializeXxx`. Call it once manually in a
`beforeEach`, then assert the second call reverts:

```typescript
describe("when already initialised", () => {
  beforeEach(async () => {
    await asset.connect(deployer).initializeXxx(/* args */);
  });

  it("GIVEN an already-initialised facet WHEN initializeXxx is called again THEN it reverts with FacetAlreadyRegistered", async () => {
    await expect(asset.initializeXxx(/* args */)).to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered");
  });
});
```

> After `initialize-factory` Part A is applied, the standard fixture already calls
> `initializeXxx`, so the `beforeEach` above is no longer needed — remove it and call
> `asset.initializeXxx(...)` directly (the facet is already registered by the fixture).

### Test 3 — event emitted on first call

Because the factory does not yet call `initializeXxx`, the standard fixture produces
an uninitialised asset for this facet. Call directly and verify the event.

**Decision rule — which assertion to use:**

| Event params                                               | Method                            |
| ---------------------------------------------------------- | --------------------------------- |
| No params (empty event)                                    | `.to.emit()` — no `.withArgs()`   |
| All scalars (`bool`, `address`, `uint256`, `bytes3`, etc.) | `.withArgs(param1, ...)` — always |
| Any `struct` or `array` param                              | `decodeEvent` — only then         |

**Never use `decodeEvent` for scalar-only or empty events.** `.withArgs()` handles scalars
correctly and is far cheaper to read and maintain.

**Empty event (no input params):**

```typescript
  it("GIVEN a caller with DEFAULT_ADMIN_ROLE WHEN initializeXxx is called THEN it emits XxxInitialized", async () => {
    await expect(asset.connect(deployer).initializeXxx())
      .to.emit(asset, "XxxInitialized");
  });
}); // end describe("initializeXxx")
```

**Scalar params — `.withArgs()` without operator:**

```typescript
  it("GIVEN a caller with DEFAULT_ADMIN_ROLE WHEN initializeXxx is called THEN it emits XxxInitialized", async () => {
    await expect(asset.connect(deployer).initializeXxx(/* args */))
      .to.emit(asset, "XxxInitialized")
      .withArgs(/* scalar args in declaration order */);
  });
}); // end describe("initializeXxx")
```

**Struct or array params only — `decodeEvent` without operator assertion:**

```typescript
import { decodeEvent } from "@scripts/infrastructure";

  it("GIVEN a caller with DEFAULT_ADMIN_ROLE WHEN initializeXxx is called THEN it emits XxxInitialized", async () => {
    const tx = await asset.connect(deployer).initializeXxx(/* args */);
    const receipt = await tx.wait();
    const args = await decodeEvent(asset, "XxxInitialized", receipt!);
    expect(args.param1).to.deep.equal(expectedValue); // deep.equal for structs/arrays
  });
}); // end describe("initializeXxx")
```

> After `initialize-factory` Part A is applied, Test 3 must be adapted: the standard
> fixture already calls `initializeXxx`, so deploy a fresh proxy to get an uninitialised
> asset (see Option A in `initialize-update` Step G).

---

## 9. Step G — Create changeset

Create `.changeset/initialize-[facet-name-kebab].md`:

```markdown
---
"@hashgraph/asset-tokenization-contracts": minor
---

Add `initializeXxx` function to [FacetName] facet with centralised registration
via `InitializerStorageWrapper.setFacetToReady`. Emits `[X]Initialized` event.
```

---

## 10. Acceptance Criteria

**This section is BLOCKING. Do NOT declare the skill complete until every command below
passes. Run each command, show the output, and confirm the criterion is met.**

### AC-1 — Selector registered

```bash
rg "initializeXxx.selector" packages/ats/contracts/contracts/ -g "*.sol"
```

Expected: exactly 1 match in the concrete facet's `getStaticFunctionSelectors`. If missing,
the proxy will silently swallow factory calls to `initializeXxx` — fix before continuing.

### AC-2 — All 3 tests exist in the test file

```bash
rg "XxxInitialized" packages/ats/contracts/test/ -g "*.ts" -l
```

Expected: at least one file listed. Then confirm the file contains all three tests:

```bash
rg "FacetAlreadyRegistered|AccountHasNoRole|XxxInitialized" \
  <path-to-test-file> --count
```

Expected: 3 or more matches (one per test). If any are missing, write the missing
tests from Step F before continuing.

### AC-3 — All 3 tests pass

```bash
cd packages/ats/contracts && \
  npm run test --no-compile -- --grep "initializeXxx"
```

Expected: 3 passing tests, 0 failing. If any test fails, fix the implementation
or test — do NOT skip.

### AC-4 — Event declared and NatSpec complete

```bash
rg "event XxxInitialized" packages/ats/contracts/contracts/ -g "*.sol"
```

Expected: exactly 1 match in the interface file (`IXxx.sol`). Verify manually that:

- No `operator` param — the event carries only the function's input parameters
- For no-param functions: `event XxxInitialized()` with no params at all
- Params match the function signature (without `calldata`/`memory`; structs as-is)
- `@notice` and `@dev` tags are present; `@param` tags for each param (none for empty events)

### AC-5 — Compile clean

```bash
cd packages/ats/contracts && npm run compile --force 2>&1 | grep -E "Warning|Error" | head -20
```

Expected: 0 warnings and 0 errors on the modified files.

### AC-6 — Solhint ordering clean

```bash
cd packages/ats/contracts && npx solhint --config solhint.config.js 'contracts/**/*.sol' 2>&1 | grep "ordering" | grep -i "error"
```

Expected: 0 lines. Any `ordering` error means a `struct` or `enum` was placed after an `event`
in the modified interface — move the `XxxInitialized` event to appear after the last type
definition. This is the most common mistake introduced by this skill.

---

## 11. Factory.sol note

`initialize-add` does **not** touch `Factory.sol` — that is handled by `initialize-factory`
Part A. However, when `initialize-factory` eventually wires the new `initializeXxx` call,
the bootstrap-admin invariant applies:

- Do **not** patch the rbacs-copy block or add per-facet admin workarounds.
- `Factory._deploySecurity` already appends `address(this)` as `DEFAULT_ADMIN_ROLE` before
  constructing the `ResolverProxy` and renounces it after all initialisers run.
- The only addition needed in `Factory.sol` is the `initializeXxx` call at the correct
  position in the initialiser sequence, before `renounceRole`.

See `workflows/FACTORY.md` for the full wiring procedure.

---

## 12. Verification checklist (static review)

- [ ] Function name is `initializeXxx` (camelCase, no underscore — `initialize_Xxx` is forbidden)
- [ ] No `// solhint-disable-next-line func-name-mixedcase` before the function
- [ ] Event declared in `IXxx.sol` with NatSpec — no `operator` param
- [ ] Event carries only the function's input params (same types and order; structs as-is); empty event for no-param functions
- [ ] Event placed **after** all `struct`/`enum` definitions in `IXxx.sol` (Solhint ordering rule)
- [ ] Function declared in `IXxx.sol` with NatSpec
- [ ] `onlyRole(DEFAULT_ADMIN_ROLE)` is the first modifier after `override`
- [ ] `onlyFacetNotRegistered(_XXX_RESOLVER_KEY)` is the second modifier
- [ ] `InitializerStorageWrapper.setFacetToReady(_XXX_RESOLVER_KEY)` called before the emit
- [ ] `emit XxxInitialized(...)` is the last statement — no `EvmAccessors.getMsgSender()` call
- [ ] `this.initializeXxx.selector` added to `getStaticFunctionSelectors`
- [ ] Test 3 uses no `.withArgs()` for empty events; `.withArgs(param1, ...)` for scalars; `decodeEvent` only for struct/array params
- [ ] `npm run format:check` passes on all modified files
- [ ] Solhint produces no new errors on modified files
- [ ] `rg "initializeXxx" contracts/factory/Factory.sol` — note if missing; flag for `initialize-factory`
- [ ] Changeset file created under `.changeset/`
- [ ] If `XxxModifiers.sol` is now empty after migration: delete the file and remove its `import` and `is XxxModifiers` clause from `AssetModifiers.sol` (or equivalent aggregator)
