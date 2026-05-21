---
name: initialize-update
description: >
  Migrate an existing `initializeXxx` function from the old boolean-guard pattern to the
  centralised `InitializerStorageWrapper` pattern. Updates the facet, interface, storage
  wrapper, modifier files, Factory.sol, and all TypeScript callers atomically.
  Trigger: when a `.sol` facet has an `initializeXxx` function that still uses
  `onlyNot[X]Initialized` or an equivalent per-facet boolean guard.
---

# Skill: initialize-update

Transforms an existing `initializeXxx` function from the old per-facet boolean guard to the
centralised initialiser pattern. Leaves the entire repository in a compilable, consistent
state after each run.

---

## 1. Detection — is this skill applicable?

Apply this skill when ALL of the following are true:

- The file contains a function whose name starts with `initialize` (including `initialize_Xxx`)
- That function uses a modifier matching `onlyNot[X]Initialized` OR checks a per-facet
  `bool initialized` field
- The function does NOT yet use `onlyFacetNotRegistered`

If the function already uses `onlyFacetNotRegistered`, this skill has already been applied — stop.

---

## 2. Naming rules (non-negotiable)

- Function name MUST be `initializeXxx` — camelCase, no underscore separator.
- `initialize_Xxx` is **forbidden**. Never write it, never accept it from a generated diff.
- Never add `// solhint-disable-next-line func-name-mixedcase` before an `initializeXxx`
  function. If Solhint flags it, the name is wrong — fix the name, do not suppress the linter.

---

## 3. Locate companion files

Before making any change, identify all files that will be touched:

| File                                      | How to find it                                                         |
| ----------------------------------------- | ---------------------------------------------------------------------- |
| Facet implementation (`.sol`)             | Input file                                                             |
| Interface (`IXxx.sol`)                    | Same directory or `facets/` parent                                     |
| Storage wrapper (`XxxStorageWrapper.sol`) | `domain/` tree; imported by the facet                                  |
| Modifier file (`XxxModifiers.sol`)        | `services/core/` or `services/asset/`                                  |
| `Factory.sol`                             | `contracts/factory/Factory.sol`                                        |
| TypeScript tests                          | `test/contracts/integration/` subtree — grep for the old function name |
| TypeScript scripts / fixtures             | `scripts/` and `test/fixtures/` — grep for the old function name       |

---

## 4. Step A — Rename the function (if it contains `_`)

Functions such as `initialize_ERC3643`, `_initialize_equityUSA`, `initialize_ERC1410` must be
renamed to camelCase without underscores:

```
initialize_ERC3643    →  initializeERC3643
_initialize_equityUSA →  initializeEquityUSA
initialize_ERC1410    →  initializeERC1410
```

Apply the rename in:

1. Facet implementation — rename the function AND remove the `// solhint-disable-next-line func-name-mixedcase` comment immediately above it
2. Interface (`IXxx.sol`) — rename the function signature AND remove the `// solhint-disable-next-line func-name-mixedcase` comment; also update any NatSpec `@dev` that references the old name
3. `Factory.sol` — find the exact call and update it (preserve mandatory / `_tryInitialize_` pattern)
4. TypeScript — every `.test.ts`, `fixture.ts`, and script file that references the old name

> Do not rename functions that are already camelCase without underscores.

> When removing the `// solhint-disable-next-line func-name-mixedcase` line, verify with:
>
> ```bash
> rg "solhint-disable-next-line func-name-mixedcase" packages/ats/contracts/contracts/ -g "*.sol"
> ```
>
> Expected: 0 matches after the rename (no suppress comment should remain for this function).

---

## 5. Step B — Replace modifiers

**Remove** the old per-facet guard modifier from the function signature.  
**Add** in its place — immediately after `override` (if present), before any business modifiers:

```solidity
onlyRole(DEFAULT_ADMIN_ROLE)
onlyFacetNotRegistered(_XXX_RESOLVER_KEY)
```

Resulting order:

```solidity
function initializeXxx(...)
    external
    override                                       // if present
    onlyRole(DEFAULT_ADMIN_ROLE)                   // NEW — first after override; ensures non-admin tests work without a fresh fixture
    onlyFacetNotRegistered(_XXX_RESOLVER_KEY)      // NEW — second
    onlyExistingBusinessModifier(...)              // keep all existing business modifiers
{
```

**Locate `_XXX_RESOLVER_KEY`** in `contracts/constants/resolverKeys.sol`.  
Pattern: `_[FEATURE_NAME_SCREAMING_SNAKE]_RESOLVER_KEY`  
(e.g. `_CAP_RESOLVER_KEY`, `_CONTROL_LIST_RESOLVER_KEY`)

**Required imports** (add if missing; adjust relative paths from the facet's location):

```solidity
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { _XXX_RESOLVER_KEY } from "../../constants/resolverKeys.sol";
```

`onlyFacetNotRegistered` and `onlyRole` are already available through
`Modifiers` → `CoreModifiers` → `InitializerModifiers` / `AccessControlModifiers`.
No new `is` clause needed.

---

## 6. Step C — Remove `bool initialized` from storage struct

Find the struct in the storage wrapper and delete the field unconditionally.
This migration intentionally breaks storage backward compatibility.

Actions:

- Delete the `bool initialized;` field from the struct
- Delete the `is[X]Initialized()` getter function in the wrapper
- Remove the `cs.initialized = true;` assignment from the internal initialise function

---

## 7. Step D — Remove old modifier infrastructure

1. **Delete the modifier** `onlyNot[X]Initialized()` from its modifier file (`XxxModifiers.sol`)
2. **Delete the check helper** (`_checkNotInitialized(bool)` or equivalent) only if no other
   modifier in the codebase uses it
3. **Verify** no remaining references:
   ```
   rg "onlyNot[X]Initialized" contracts/ -g "*.sol"
   ```
   If another file still references it, do not delete — report and stop.

---

## 8. Step E — Update the function body

Add at the end of the function body, **before** any existing `emit` statement:

```solidity
InitializerStorageWrapper.setFacetToReady(_XXX_RESOLVER_KEY);
```

Final body order:

1. Existing business logic (e.g. `XxxStorageWrapper.initializeXxx(...)`)
2. `InitializerStorageWrapper.setFacetToReady(_XXX_RESOLVER_KEY);`
3. `emit XxxInitialized(...);`

### Factory.sol note

Do **not** patch the rbacs-copy block or add new conditional logic per migration. The Factory
already appends a dedicated `DEFAULT_ADMIN_ROLE` entry unconditionally before constructing the
proxy, and renounces it at the end of `_deploySecurity`. The only required change per migration is
adding the new `initializeXxx` call at the correct position in the initialiser sequence, before the
`renounceRole` call.

---

## 9. Step F — Add or fix the event

### Solhint ordering rule

In `IXxx.sol` the event MUST appear **after** all `struct` and `enum` definitions.
Solhint reports a hard error if any event precedes a type definition in the same interface.
Place `XxxInitialized` immediately before the other `event` declarations, never at the top:

```solidity
// correct
struct Foo { ... }
enum Bar { ... }

event XxxInitialized(address indexed operator);  // ← after types
event SomeOtherEvent(...);
```

### Event signature rule

The event carries **only** the function's input parameters — no `operator`. The caller can
always be retrieved from the transaction context.

For functions with no input parameters, the event is **empty**:

```solidity
event XxxInitialized();
emit XxxInitialized();
```

For functions with parameters:

```solidity
// In the interface IXxx.sol:
event XxxInitialized(
    ParamType1 param1,   // same params as the function, without calldata/memory
    ParamType2 param2
);

// In the implementation:
emit XxxInitialized(param1, param2);
```

Structs are passed as-is — do not unpack them:

```solidity
// ✅ correct
event XxxInitialized(SomeStruct data);

// ✗ wrong — unpacking adds maintenance burden
event XxxInitialized(uint256 field1, address field2);
```

### Event naming

Strip `initialize` prefix, append `Initialized` suffix:

- `initializeCap` → `CapInitialized`
- `initializeERC3643` → `ERC3643Initialized`
- `initializeCapByPartition` → `CapByPartitionInitialized`

### NatSpec (in the interface)

```solidity
/**
 * @notice Emitted once when the [facet name] capability is initialised on a token.
 * @dev Fires exclusively from `initializeXxx` after the storage write succeeds.
 * @param param1 [Description].
 */
event XxxInitialized(ParamType1 param1);
```

For empty events (no input params):

```solidity
/**
 * @notice Emitted once when the [facet name] capability is initialised on a token.
 * @dev Fires exclusively from `initializeXxx`.
 */
event XxxInitialized();
```

---

## 10. Step G — Update tests

Add a dedicated `describe` block in the facet's existing integration test file.
Use the project's **GIVEN/WHEN/THEN** naming convention throughout.
Canonical reference: `test/contracts/integration/clearing.test.ts` → `describe("initializeClearing")`.

### Where to place them

Find or create a block next to the existing initialisation tests:

```typescript
describe("initializeXxx", () => {
  // Tests 1, 2, 3 go here
});
```

If a test for double-initialisation already exists (old pattern), move it inside this block
and update the error name and description.

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
`AccountHasNoRole` regardless of whether the facet is already registered. Use the standard
`asset` directly — no fresh proxy needed:

```typescript
describe("initializeXxx", () => {
  it("GIVEN a caller without DEFAULT_ADMIN_ROLE WHEN initializeXxx is called THEN it reverts with AccountHasNoRole", async () => {
    await expect(asset.connect(nonAdmin).initializeXxx(/* args */)).to.be.revertedWithCustomError(
      asset,
      "AccountHasNoRole",
    );
  });
```

### Test 2 — double initialisation reverts

The factory already calls `initializeXxx` during deployment, so the standard `asset` fixture
is already initialised. Call again and assert the revert:

```typescript
it("GIVEN an already-initialised facet WHEN initializeXxx is called again THEN it reverts with FacetAlreadyRegistered", async () => {
  await expect(asset.initializeXxx(/* same args as fixture */)).to.be.revertedWithCustomError(
    asset,
    "FacetAlreadyRegistered",
  );
});
```

### Test 3 — event emitted on first call

The factory already calls `initializeXxx` during deployment, so the standard fixture
has the facet initialised. Two approaches:

**Option A — check the event from the factory deployment receipt** (preferred when a
fresh fixture is not available):

```typescript
  it("GIVEN a new deployment WHEN the factory calls initializeXxx THEN it emits XxxInitialized", async () => {
    const { diamond, deployer, deploymentReceipt } = await deployXxxTokenFixture({ ... });
    const iface = IXxx__factory.createInterface();
    const event = deploymentReceipt.logs
      .map((log) => { try { return iface.parseLog(log); } catch { return null; } })
      .find((e) => e?.name === "XxxInitialized");
    expect(event).to.not.be.undefined;
    expect(event!.args.operator).to.equal(await deployer.getAddress());
  });
```

**Option B — deploy a fixture that does NOT call `initializeXxx`** (use when a minimal
proxy fixture is available or can be created):

```typescript
  it("GIVEN a fresh deployment WHEN initializeXxx is called THEN it emits XxxInitialized", async () => {
    const { diamond, deployer } = await deployFreshProxyFixture(); // no initializeXxx called
    const asset = await ethers.getContractAt("IXxx", diamond.target);
    await expect(asset.connect(deployer).initializeXxx(/* args */))
      .to.emit(asset, "XxxInitialized")
      .withArgs(/* scalar args in declaration order — no operator */);
  });
}); // end describe("initializeXxx")
```

Choose the option that requires the least custom infrastructure.

**Decision rule — which assertion to use:**

| Event params                                               | Method                            |
| ---------------------------------------------------------- | --------------------------------- |
| No params (empty event)                                    | `.to.emit()` — no `.withArgs()`   |
| All scalars (`bool`, `address`, `uint256`, `bytes3`, etc.) | `.withArgs(param1, ...)` — always |
| Any `struct` or `array` param                              | `decodeEvent` — only then         |

**Never use `decodeEvent` for scalar-only or empty events.** `.withArgs()` handles scalars
correctly and is far cheaper to read and maintain.

**Struct or array params only — `decodeEvent` without operator assertion:**

```typescript
import { decodeEvent } from "@scripts/infrastructure";

// Option A — replace the parseLog approach:
const args = await decodeEvent(asset, "XxxInitialized", deploymentReceipt);
expect(args.param1).to.deep.equal(expectedStruct); // deep.equal for structs/arrays

// Option B — replace .withArgs():
const tx = await asset.connect(deployer).initializeXxx(/* args */);
const receipt = await tx.wait();
const args = await decodeEvent(asset, "XxxInitialized", receipt!);
expect(args.param1).to.deep.equal(expectedStruct);
```

**If any error has dynamic type params (struct or array):**

```typescript
import { decodeCustomError } from "@scripts/infrastructure";

try {
  await asset.someAction();
  expect.fail("Expected revert");
} catch (e) {
  const decoded = await decodeCustomError(asset, "ErrorName", e);
  expect(decoded.param1).to.deep.equal(expected);
}
```

---

## 11. Step H — Create changeset

Create `.changeset/initialize-[facet-name-kebab].md`:

```markdown
---
"@hashgraph/asset-tokenization-contracts": major
"@hashgraph/asset-tokenization-sdk": major
---

Migrate [FacetName] initialisation from per-facet boolean guard to centralised
InitializerStorageWrapper pattern. Replaces `onlyNot[X]Initialized` with
`onlyRole(DEFAULT_ADMIN_ROLE)` + `onlyFacetNotRegistered`. Emits `[X]Initialized`
on successful initialisation.
```

Include `sdk: major` only if the function was renamed (breaking SDK callers).
If there was no rename, use `contracts: major` only.

---

## 12. Acceptance Criteria

**This section is BLOCKING. Do NOT declare the skill complete until every command below
passes. Run each command, show the output, and confirm the criterion is met.**

### AC-1 — Dead code removed

```bash
rg "onlyNot[X]Initialized" packages/ats/contracts/contracts/ -g "*.sol"
rg "is[X]Initialized"      packages/ats/contracts/contracts/ -g "*.sol"
```

Expected: 0 matches. If any match is found, stop and fix before continuing.

### AC-2 — All 3 event-related tests exist in the test file

```bash
rg "XxxInitialized" packages/ats/contracts/test/ -g "*.ts" -l
```

Expected: at least one file listed. Then confirm the file contains all three tests:

```bash
rg "FacetAlreadyRegistered|AccountHasNoRole|XxxInitialized" \
  <path-to-test-file> --count
```

Expected: 3 or more matches (one per test). If any are missing, write the missing
tests from Step G before continuing.

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
in the modified interface — move `XxxInitialized` to appear after the last type definition.

---

## 13. Factory.sol note

After the factory-bootstrap-admin refactor, `Factory.sol` handles bootstrap admin
for **all** security tokens (Equity, Bond, etc.) by extending the `rbacs` array
with the factory address as `DEFAULT_ADMIN_ROLE` before passing it to the
`ResolverProxy` constructor. The factory renounces the role after running all
initialisers.

This means each migrated facet **no longer** needs a separate factory-side
workaround for the `renounceRole` relayer pattern. The factory gets admin
via the constructor and gives it up automatically — no per-migration
patching required.

Additions to Factory.sol for new facets are only needed if the facet is
initialised directly in `_deploySecurity`. Optional facets that use
`_tryInitialize*` wrappers do NOT need factory changes.

---

## 14. Verification checklist (static review — run after AC passes)

- [ ] Function name is `initializeXxx` (camelCase, no underscore — `initialize_Xxx` is forbidden)
- [ ] No `// solhint-disable-next-line func-name-mixedcase` before the function
- [ ] `onlyRole(DEFAULT_ADMIN_ROLE)` is the first modifier after `override`
- [ ] `onlyFacetNotRegistered(_XXX_RESOLVER_KEY)` is the second modifier
- [ ] `XxxInitialized` event placed **after** all `struct`/`enum` definitions in `IXxx.sol` (Solhint ordering rule)
- [ ] Event carries only the function's input params — no `operator`; empty event for no-param functions
- [ ] No `EvmAccessors.getMsgSender()` call in the emit statement
- [ ] `import { DEFAULT_ADMIN_ROLE }` present in the facet
- [ ] `bool initialized` deleted from the struct (backward compatibility intentionally broken)
- [ ] `setFacetToReady` called before the emit in the function body
- [ ] Test 3 uses no `.withArgs()` for empty events; `.withArgs(param1, ...)` for scalars; `decodeEvent` only for struct/array params
- [ ] If error has dynamic types (struct/array): assertion uses `decodeCustomError`, not `.withArgs()`
- [ ] `npm run format:check` passes on all modified files
- [ ] Solhint produces no new errors on modified files
- [ ] Changeset file created under `.changeset/`
- [ ] `rg "oldFunctionName" . -g "*.sol" -g "*.ts"` returns 0 matches (if renamed)
- [ ] If function was renamed: `rg "solhint-disable-next-line func-name-mixedcase" contracts/ -g "*.sol"` returns 0 matches for the migrated facet
- [ ] If modifier file (`XxxModifiers.sol`) is now empty after migration: delete it and remove all references (import + `is` clause) from aggregator contracts like `AssetModifiers.sol`
