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

Add the following three tests in the facet's existing integration test file:

### Test 1 — double initialisation reverts

```typescript
it("should revert WHEN initializeXxx is called twice", async () => {
  await expect(asset.initializeXxx(/* args */)).to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered");
});
```

### Test 2 — no DEFAULT_ADMIN_ROLE reverts

```typescript
it("should revert WHEN caller does not have DEFAULT_ADMIN_ROLE", async () => {
  await expect(asset.connect(nonAdmin).initializeXxx(/* args */)).to.be.revertedWithCustomError(
    asset,
    "AccessControlUnauthorizedAccount",
  );
});
```

### Test 3 — event emitted on success

```typescript
it("should emit XxxInitialized WHEN initializeXxx succeeds", async () => {
  await expect(freshAsset.initializeXxx(/* args */))
    .to.emit(freshAsset, "XxxInitialized")
    .withArgs(deployerAddress /* + other args in declaration order */);
});
```

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

## 9. Verification checklist

- [ ] Event declared in `IXxx.sol` with `address indexed operator` as first param and NatSpec
- [ ] Function declared in `IXxx.sol` with NatSpec
- [ ] `onlyFacetNotRegistered` is first modifier after `override`
- [ ] `onlyRole(DEFAULT_ADMIN_ROLE)` is second modifier
- [ ] `InitializerStorageWrapper.setFacetToReady(_XXX_RESOLVER_KEY)` called before the emit
- [ ] `emit XxxInitialized(EvmAccessors.getMsgSender(), ...)` is the last statement
- [ ] `this.initializeXxx.selector` added to `getStaticFunctionSelectors`
- [ ] All 3 new tests pass: `npm run test --no-compile --grep "initializeXxx"`
- [ ] `rg "initializeXxx" contracts/factory/Factory.sol` — note if a Factory call is missing;
      flag it for `initialize-factory` skill
- [ ] Changeset file created under `.changeset/`
- [ ] Solhint produces no new errors on modified files
