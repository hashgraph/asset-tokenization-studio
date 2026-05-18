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
centralised initializer pattern. Leaves the entire repository in a compilable, consistent
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

## 2. Locate companion files

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

## 3. Step A — Rename the function (if it contains `_`)

Functions such as `initialize_ERC3643`, `_initialize_equityUSA`, `initialize_ERC1410` must be
renamed to camelCase without underscores:

```
initialize_ERC3643    →  initializeERC3643
_initialize_equityUSA →  initializeEquityUSA
initialize_ERC1410    →  initializeERC1410
```

Apply the rename in:

1. Facet implementation
2. Interface (`IXxx.sol`)
3. `Factory.sol` — find the exact call and update it (preserve mandatory / `_tryInitialize_` pattern)
4. TypeScript — every `.test.ts`, `fixture.ts`, and script file that references the old name

> Do not rename functions that are already camelCase without underscores.

---

## 4. Step B — Replace modifiers

**Remove** the old per-facet guard modifier from the function signature.  
**Add** in its place — immediately after `override` (if present), before any business modifiers:

```solidity
onlyFacetNotRegistered(_XXX_RESOLVER_KEY)
onlyRole(DEFAULT_ADMIN_ROLE)
```

Resulting order:

```solidity
function initializeXxx(...)
    external
    override                                       // if present
    onlyFacetNotRegistered(_XXX_RESOLVER_KEY)      // NEW — first after override
    onlyRole(DEFAULT_ADMIN_ROLE)                   // NEW — second
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

## 5. Step C — Remove `bool initialized` from storage struct

Find the struct in the storage wrapper and delete the field unconditionally.
This migration intentionally breaks storage backward compatibility.

Actions:

- Delete the `bool initialized;` field from the struct
- Delete the `is[X]Initialized()` getter function in the wrapper
- Remove the `cs.initialized = true;` assignment from the internal initialize function

---

## 6. Step D — Remove old modifier infrastructure

1. **Delete the modifier** `onlyNot[X]Initialized()` from its modifier file (`XxxModifiers.sol`)
2. **Delete the check helper** (`_checkNotInitialized(bool)` or equivalent) only if no other
   modifier in the codebase uses it
3. **Verify** no remaining references:
   ```
   rg "onlyNot[X]Initialized" contracts/ -g "*.sol"
   ```
   If another file still references it, do not delete — report and stop.

---

## 7. Step E — Update the function body

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

## 8. Step F — Add or fix the event

### Event signature rule

```solidity
// In the interface IXxx.sol:
event XxxInitialized(
    address indexed operator,   // ALWAYS first — mandatory even with no other params
    ParamType1 param1,          // same params as the function, without calldata/memory
    ParamType2 param2
);

// In the implementation:
emit XxxInitialized(EvmAccessors.getMsgSender(), param1, param2);
```

For functions with no input parameters:

```solidity
event XxxInitialized(address indexed operator);   // operator only — never empty
emit XxxInitialized(EvmAccessors.getMsgSender());
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
 * @param operator The account that invoked initialisation (deployer or upgrade caller).
 * @param param1 [Description].
 */
event XxxInitialized(address indexed operator, ParamType1 param1);
```

---

## 9. Step G — Update tests

Add a dedicated `describe` block in the facet's existing integration test file.
Use the project's **GIVEN/WHEN/THEN** naming convention throughout.

### Where to place them

Find or create a block next to the existing initialisation tests:

```typescript
describe("initializeXxx", () => {
  // Test 1, 2, 3 go here
});
```

If a test for double-initialisation already exists (old pattern), move it inside this block
and update the error name and description.

### Signers

- `deployer` / `admin` — the account with `DEFAULT_ADMIN_ROLE` (comes from the fixture)
- `nonAdmin` — any signer that has **no** `DEFAULT_ADMIN_ROLE`. Use `user3` or equivalent
  from the fixture (verify it has not been granted the role in `beforeEach`).

### Test 1 — double initialisation reverts

```typescript
it("GIVEN an already-initialised facet WHEN initializeXxx is called again THEN it reverts with FacetAlreadyRegistered", async () => {
  await expect(asset.initializeXxx(/* same args as fixture */)).to.be.revertedWithCustomError(
    asset,
    "FacetAlreadyRegistered",
  );
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
    .withArgs(await deployer.getAddress() /* + other args in declaration order */);
});
```

Choose the option that requires the least custom infrastructure. Document the choice
with a one-line comment if it is not obvious.

**If the event has dynamic types (struct or array params):**

`.withArgs()` does not handle structs or arrays reliably. Use `decodeEvent` from
`@scripts/infrastructure` and assert fields individually:

```typescript
import { decodeEvent } from "@scripts/infrastructure";

// Option A — replace the parseLog approach:
const args = await decodeEvent(asset, "XxxInitialized", deploymentReceipt);
expect(args.operator).to.equal(await deployer.getAddress());
expect(args.param1).to.deep.equal(expectedStruct); // deep.equal for structs/arrays

// Option B — replace .withArgs():
const tx = await asset.connect(deployer).initializeXxx(/* args */);
const receipt = await tx.wait();
const args = await decodeEvent(asset, "XxxInitialized", receipt!);
expect(args.operator).to.equal(await deployer.getAddress());
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

## 10. Step H — Create changeset

Create `.changeset/initialize-[facet-name-kebab].md`:

```markdown
---
"@hashgraph/asset-tokenization-contracts": major
"@hashgraph/asset-tokenization-sdk": major
---

Migrate [FacetName] initialisation from per-facet boolean guard to centralised
InitializerStorageWrapper pattern. Replaces `onlyNot[X]Initialized` with
`onlyFacetNotRegistered` + `onlyRole(DEFAULT_ADMIN_ROLE)`. Emits `[X]Initialized`
on successful initialisation.
```

Include `sdk: major` only if the function was renamed (breaking SDK callers).
If there was no rename, use `contracts: major` only.

---

## 11. Acceptance Criteria

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

- First param is `address indexed operator`
- Remaining params match the function signature (without `calldata`/`memory`)
- `@notice`, `@dev`, and all `@param` tags are present

### AC-5 — Compile clean

```bash
cd packages/ats/contracts && npm run compile --force 2>&1 | grep -E "Warning|Error" | head -20
```

Expected: 0 warnings and 0 errors on the modified files.

---

## 12. Factory.sol note

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

## 13. Verification checklist (static review — run after AC passes)

- [ ] `onlyFacetNotRegistered(_XXX_RESOLVER_KEY)` is the first modifier after `override`
- [ ] `onlyRole(DEFAULT_ADMIN_ROLE)` is the second modifier
- [ ] `import { DEFAULT_ADMIN_ROLE }` present in the facet
- [ ] `bool initialized` deleted from the struct (backward compatibility intentionally broken)
- [ ] `setFacetToReady` called before the emit in the function body
- [ ] If event has dynamic types (struct/array): Test 3 uses `decodeEvent`, not `.withArgs()`
- [ ] If error has dynamic types (struct/array): assertion uses `decodeCustomError`, not `.withArgs()`
- [ ] `npm run format:check` passes on all modified files
- [ ] Solhint produces no new errors on modified files
- [ ] Changeset file created under `.changeset/`
- [ ] `rg "oldFunctionName" . -g "*.sol" -g "*.ts"` returns 0 matches (if renamed)
