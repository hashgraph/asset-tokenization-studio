---
name: initialize-event-check
description: >
  Audit every `initializeXxx` function in a Solidity file and fix missing or malformed
  event emission. Checks that an event is declared in the interface with the correct
  signature, emitted at the end of the body, and carries proper NatSpec.
  Auto-fixes mechanical issues; reports ambiguous cases for human review.
  Trigger: after running `initialize-update` or `initialize-add`, or on any `.sol` file
  suspected of having incomplete initialisation event coverage.
---

# Skill: initialize-event-check

Audits `initializeXxx` functions against the event emission contract and fixes every
deviation it can resolve mechanically. Runs per file. Safe to run multiple times.

---

## 1. When to use

- After applying `initialize-update` or `initialize-add` to verify the output
- On any `.sol` file to catch partially-migrated initialize functions
- As a sweep across the entire `contracts/facets/` tree to find gaps

---

## 2. Audit checklist — run for each `initializeXxx` found

For each `external` function whose name starts with `initialize`:

| #   | Check                                                | Pass condition                                                   |
| --- | ---------------------------------------------------- | ---------------------------------------------------------------- |
| C1  | Function emits an event                              | Body contains an `emit` statement                                |
| C2  | Event name is correct                                | Strip `initialize` prefix + `Initialized` suffix                 |
| C3  | Event declared in interface                          | `IXxx.sol` contains the event declaration                        |
| C4  | First event param is `address indexed operator`      | Event signature starts with `address indexed operator`           |
| C5  | Remaining params match function inputs               | Same types and order, without `calldata`/`memory`                |
| C6  | Emit uses `EvmAccessors.getMsgSender()` as first arg | `emit XxxInitialized(EvmAccessors.getMsgSender(), ...)`          |
| C7  | Emit is the last statement in the body               | No code after the `emit` line                                    |
| C8  | `setFacetToReady` precedes the emit                  | `InitializerStorageWrapper.setFacetToReady(...)` before `emit`   |
| C9  | NatSpec present on event in interface                | `@notice`, `@dev` (fires exclusively from...), `@param operator` |

---

## 3. Fix procedures

### C1 fails — no emit at all

Create the event and add the emit. Follow Steps B through F of `initialize-add`.

### C2 fails — event has wrong name

Rename the event in the interface and all emit sites.  
Rule: strip `initialize` prefix, append `Initialized`.  
Example: `emit Initialized(...)` → `emit CapInitialized(...)`

### C3 fails — event declared only in implementation, not in interface

Move the declaration to `IXxx.sol`. Use `/// @inheritdoc IXxx` above the function.
Do not duplicate the declaration.

### C4 fails — `address indexed operator` missing as first param

If missing entirely, insert it at position 0:

```solidity
// Before
event XxxInitialized(uint256 value);

// After
event XxxInitialized(address indexed operator, uint256 value);
```

Update all emit sites to pass `EvmAccessors.getMsgSender()` as the first argument.  
If the `address` exists but is not `indexed`, add the `indexed` keyword.

### C5 fails — event params do not match function inputs

Correct the event signature to mirror the function's input parameters in order, without
`calldata` or `memory`:

```solidity
// Function
function initializeCap(uint256 maxSupply, PartitionCap[] calldata partitionCap) external ...

// Correct event
event CapInitialized(
    address indexed operator,
    uint256 maxSupply,
    PartitionCap[] partitionCap    // no calldata
);
```

### C6 fails — first emit argument is not `EvmAccessors.getMsgSender()`

Replace with `EvmAccessors.getMsgSender()`. Add import if missing:

```solidity
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
```

### C7 fails — code appears after the emit

Move the `emit` to be the last line. If post-emit code is non-trivial, **report** — do
not reorder blindly.

### C8 fails — `setFacetToReady` after the emit or missing

Reorder so `setFacetToReady` precedes the emit. If absent entirely, add it:

```solidity
InitializerStorageWrapper.setFacetToReady(_XXX_RESOLVER_KEY);
emit XxxInitialized(EvmAccessors.getMsgSender(), ...);
```

### C9 fails — NatSpec missing or incomplete

Add or complete in the interface:

```solidity
/**
 * @notice Emitted once when the [facet name] capability is initialised on a token.
 * @dev Fires exclusively from `initializeXxx` after the storage write succeeds.
 * @param operator The account that invoked initialisation (deployer or upgrade caller).
 * @param param1 [Description].
 */
event XxxInitialized(address indexed operator, Type1 param1);
```

---

## 4. Cases to report, not auto-fix

Auto-fix only when the correction is unambiguous. Report and stop when:

- Event parameters include types not present in the function signature (e.g. emitting
  storage values not passed as input) — intent is unclear
- More than one `emit` statement in the body — requires human judgment
- Significant logic appears after the emit — reordering could change behaviour
- The RESOLVER_KEY cannot be determined from `resolverKeys.sol`

Report format:

```
FILE: contracts/facets/xxx/Xxx.sol
FUNCTION: initializeXxx (line N)
ISSUE: [description]
ACTION NEEDED: [what the developer must decide]
```

---

## 5. Changeset

Create a changeset only if at least one fix was applied:

```markdown
---
"@hashgraph/asset-tokenization-contracts": minor
---

Fix `[X]Initialized` event on `[FacetName].initializeXxx`: [brief description of what
was wrong and what was corrected].
```

Use `patch` instead of `minor` if only NatSpec or emit argument order was corrected
with no ABI change.

---

## 6. Output summary

After processing a file, output a table of results:

```
initialize-event-check: Xxx.sol
  initializeXxx
    C1 ✓  emits event
    C2 ✓  event name correct
    C3 ✗  FIXED — moved event declaration to IXxx.sol
    C4 ✓  address indexed operator present
    C5 ✗  FIXED — removed calldata from event param
    C6 ✓  EvmAccessors.getMsgSender() used
    C7 ✓  emit is last statement
    C8 ✗  FIXED — reordered setFacetToReady before emit
    C9 ✗  FIXED — added NatSpec to event in IXxx.sol
```

---

## 7. Changeset

Create a changeset only if at least one fix was applied:

```markdown
---
"@hashgraph/asset-tokenization-contracts": minor
---

Fix `[X]Initialized` event on `[FacetName].initializeXxx`: [brief description of what
was wrong and what was corrected].
```

Use `patch` instead of `minor` if only NatSpec or emit argument order was corrected
with no ABI change.

---

## 8. Verification checklist

- [ ] C1–C9 all pass or are explicitly reported as ambiguous
- [ ] No `emit` statement missing from any `initializeXxx`
- [ ] Every event name matches the `[FacetName]Initialized` convention
- [ ] Every event is declared in the interface (`IXxx.sol`), not only in the implementation
- [ ] `address indexed operator` is the first parameter on every event
- [ ] `EvmAccessors.getMsgSender()` is the first argument in every emit call
- [ ] `setFacetToReady` precedes the emit in every function body
- [ ] Test 3 (event emission with `withArgs`) exists and passes for every `initializeXxx`
- [ ] Changeset created if any fix was applied
