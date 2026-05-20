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

## 2. Step A — Locate the RESOLVER_KEY

Open `contracts/constants/resolverKeys.sol` and find the constant for this facet.  
Pattern: `_[FEATURE_NAME_SCREAMING_SNAKE]_RESOLVER_KEY`

Examples:

- Cap by partition → `_CAP_BY_PARTITION_RESOLVER_KEY`
- Allowance → `_ALLOWANCE_RESOLVER_KEY`
- ERC1410 → `_ERC1410_RESOLVER_KEY`

---

## 3. Step B — Define the event in the interface

In `IXxx.sol`, add the event declaration before the function declarations.

`address indexed operator` is **always** the first parameter, even when the function has no
input parameters:

```solidity
/**
 * @notice Emitted once when the [facet name] capability is initialised on a token.
 * @dev Fires exclusively from `initializeXxx` after the storage write succeeds.
 * @param operator The account that invoked initialisation (deployer or upgrade caller).
 */
event XxxInitialized(address indexed operator);
```

If `initializeXxx` takes parameters, include them after `operator`:

```solidity
/**
 * @notice Emitted once when the [facet name] capability is initialised on a token.
 * @dev Fires exclusively from `initializeXxx` after the storage write succeeds.
 * @param operator The account that invoked initialisation (deployer or upgrade caller).
 * @param param1 [Description].
 */
event XxxInitialized(
  address indexed operator,
  ParamType1 param1, // no calldata/memory on event params
  ParamType2 param2
);
```

### Event naming rule

Strip `initialize` prefix, append `Initialized`:

- `initializeCapByPartition` → `CapByPartitionInitialized`
- `initializeAllowance` → `AllowanceInitialized`

---

## 4. Step C — Add the function to the interface

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

## 5. Step D — Implement the function in the facet

### With storage to initialise

```solidity
/// @inheritdoc IXxx
function initializeXxx(
  ParamType1 _param1
) external override onlyFacetNotRegistered(_XXX_RESOLVER_KEY) onlyRole(DEFAULT_ADMIN_ROLE) {
  XxxStorageWrapper.initializeXxx(_param1);
  InitializerStorageWrapper.setFacetToReady(_XXX_RESOLVER_KEY);
  emit XxxInitialized(EvmAccessors.getMsgSender(), _param1);
}
```

### Without storage to initialise (capability registration only)

This includes facets whose only external functions are `view` or `pure`:

```solidity
/// @inheritdoc IXxx
function initializeXxx() external override onlyFacetNotRegistered(_XXX_RESOLVER_KEY) onlyRole(DEFAULT_ADMIN_ROLE) {
  InitializerStorageWrapper.setFacetToReady(_XXX_RESOLVER_KEY);
  emit XxxInitialized(EvmAccessors.getMsgSender());
}
```

### Modifier order rule

1. `external`
2. `override`
3. `onlyFacetNotRegistered(_XXX_RESOLVER_KEY)` — always before `onlyRole`
4. `onlyRole(DEFAULT_ADMIN_ROLE)` — always before any business modifiers
5. Additional business modifiers if required at initialisation time

### Required imports (adjust relative path from the facet's location)

```solidity
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { _XXX_RESOLVER_KEY } from "../../constants/resolverKeys.sol";
```

`onlyFacetNotRegistered` and `onlyRole` are already in the inheritance chain through
`Modifiers` → `CoreModifiers` → `InitializerModifiers` / `AccessControlModifiers`.
No new `is` clause needed.

---

## 6. Step E — Register the selector in `getStaticFunctionSelectors`

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

## 7. Step F — Add tests

Add a dedicated `describe` block in the facet's existing integration test file.
Use the project's **GIVEN/WHEN/THEN** naming convention throughout.

### Where to place them

```typescript
describe("initializeXxx", () => {
  // Test 1, 2, 3 go here
});
```

### Signers

- `deployer` / `admin` — the account with `DEFAULT_ADMIN_ROLE` (comes from the fixture)
- `nonAdmin` — any signer that has **no** `DEFAULT_ADMIN_ROLE`. Use `user3` or equivalent
  from the fixture (verify it has not been granted the role in `beforeEach`).

### Test 1 — double initialisation reverts

At this stage the factory does NOT yet call `initializeXxx` (that is wired in
`initialize-factory` Part A). Call it once manually in a `beforeEach`, then try again:

```typescript
describe("initializeXxx", () => {
  beforeEach(async () => {
    await asset.connect(deployer).initializeXxx(/* args */);
  });

  it("GIVEN an already-initialised facet WHEN initializeXxx is called again THEN it reverts with FacetAlreadyRegistered", async () => {
    await expect(
      asset.initializeXxx(/* args */)
    ).to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered");
  });
```

### Test 2 — no DEFAULT_ADMIN_ROLE reverts

```typescript
it("GIVEN a caller without DEFAULT_ADMIN_ROLE WHEN initializeXxx is called THEN it reverts with AccountHasNoRole", async () => {
  await expect(asset.connect(nonAdmin).initializeXxx(/* args */)).to.be.revertedWithCustomError(
    asset,
    "AccountHasNoRole",
  );
});
```

> **After `initialize-factory` Part A is applied** (factory calls `initializeXxx` during
> deployment), the standard fixture produces an already-initialised proxy. On that proxy
> `onlyFacetNotRegistered` fires BEFORE `onlyRole`, so the test above would revert with
> `FacetAlreadyRegistered` instead of `AccountHasNoRole`. Adapt it using
> `factory.deployProxy` to get a fresh uninitialised proxy where `onlyFacetNotRegistered`
> passes and `onlyRole` can fire:
>
> ```typescript
> it("GIVEN a caller without DEFAULT_ADMIN_ROLE WHEN initializeXxx is called THEN it reverts with AccountHasNoRole", async () => {
>   const proxyTx = await factory.deployProxy(blr.target as string, CONFIG_ID, 1, [
>     { role: ATS_ROLES.DEFAULT_ADMIN_ROLE, members: [deployer.address] },
>   ]);
>   const proxyReceipt = await proxyTx.wait();
>   const { proxyAddress } = await decodeEvent(factory, "ProxyDeployed", proxyReceipt!);
>   const freshAsset = await ethers.getContractAt("IAsset", proxyAddress as string);
>   await expect(freshAsset.connect(nonAdmin).initializeXxx(/* args */)).to.be.revertedWithCustomError(
>     freshAsset,
>     "AccountHasNoRole",
>   );
> });
> ```

### Test 3 — event emitted on first call

Because the factory does not yet call `initializeXxx`, the standard fixture produces
a fresh asset. Call the function directly and verify the event:

```typescript
  it("GIVEN a fresh deployment WHEN initializeXxx is called THEN it emits XxxInitialized", async () => {
    await expect(asset.connect(deployer).initializeXxx(/* args */))
      .to.emit(asset, "XxxInitialized")
      .withArgs(await deployer.getAddress() /* + other args in declaration order */);
  });
}); // end describe("initializeXxx")
```

**If the event has dynamic types (struct or array params):**

`.withArgs()` does not handle structs or arrays reliably. Use `decodeEvent` from
`@scripts/infrastructure` and assert fields individually:

```typescript
import { decodeEvent } from "@scripts/infrastructure";

it("GIVEN a fresh deployment WHEN initializeXxx is called THEN it emits XxxInitialized", async () => {
  const tx = await asset.connect(deployer).initializeXxx(/* args */);
  const receipt = await tx.wait();
  const args = await decodeEvent(asset, "XxxInitialized", receipt!);
  expect(args.operator).to.equal(await deployer.getAddress());
  expect(args.param1).to.deep.equal(expectedStruct); // deep.equal for structs/arrays
});
```

> Once `initialize-factory` Part A is applied (factory calls `initializeXxx`), Test 3
> must be adapted: check the event in the factory deployment receipt (see Option A in
> `initialize-update` Step G).

---

## 8. Step G — Create changeset

Create `.changeset/initialize-[facet-name-kebab].md`:

```markdown
---
"@hashgraph/asset-tokenization-contracts": minor
---

Add `initializeXxx` function to [FacetName] facet with centralised registration
via `InitializerStorageWrapper.setFacetToReady`. Emits `[X]Initialized` event.
```

---

## 9. Acceptance Criteria

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

- First param is `address indexed operator`
- Remaining params match the function signature (without `calldata`/`memory`)
- `@notice`, `@dev`, and all `@param` tags are present

### AC-5 — Compile clean

```bash
cd packages/ats/contracts && npm run compile --force 2>&1 | grep -E "Warning|Error" | head -20
```

Expected: 0 warnings and 0 errors on the modified files.

---

## 10. Factory.sol note

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

## 11. Verification checklist (static review — run after AC passes)

- [ ] Event declared in `IXxx.sol` with `address indexed operator` as first param and NatSpec
- [ ] Function declared in `IXxx.sol` with NatSpec
- [ ] `onlyFacetNotRegistered` is first modifier after `override`
- [ ] `onlyRole(DEFAULT_ADMIN_ROLE)` is second modifier
- [ ] `InitializerStorageWrapper.setFacetToReady(_XXX_RESOLVER_KEY)` called before the emit
- [ ] `emit XxxInitialized(EvmAccessors.getMsgSender(), ...)` is the last statement
- [ ] `this.initializeXxx.selector` added to `getStaticFunctionSelectors`
- [ ] If event has dynamic types (struct/array): Test 3 uses `decodeEvent`, not `.withArgs()`
- [ ] `npm run format:check` passes on all modified files
- [ ] Solhint produces no new errors on modified files
- [ ] `rg "initializeXxx" contracts/factory/Factory.sol` — note if missing; flag for `initialize-factory`
- [ ] Changeset file created under `.changeset/`
