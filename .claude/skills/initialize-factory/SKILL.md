---
name: initialize-factory
description: >
  Adapt Factory.sol, TREXFactory (SecurityDeploymentLib), deployment scripts, and test
  fixtures to the centralised initializer pattern. Adds new initializer calls for facets
  that got them via `initialize-add`, wires `setOperationalStatus` in the TREX factory
  flow, and — once all facets of a config are migrated — adds `onlyOperational` to
  non-view/non-pure business functions and removes migration skips.
  Trigger: after one or more facets have been processed by `initialize-add`, or when all
  facets of an asset config (Equity, Bond, Loan) have been migrated.
---

# Skill: initialize-factory

Maintains consistency between facet initialisation changes and the factory/deployment layer.
Split into four independent parts that can be applied separately or together.

---

## Context

The deployment flow is:

```
TREXFactoryAts (optional TREX entry point)
  └── SecurityDeploymentLib.deployEquity / deployBond
        └── TRexIFactory(_atsFactory).deployEquity / deployBond  (= Factory.sol)
              └── Factory._deploySecurity()
                    ├── mandatory: initializeXxx()       — reverts if it fails
                    └── optional:  _tryInitialize_Xxx()  — try/catch, facet may not be in config
```

`setOperationalStatus()` is **never** called inside `Factory._deploySecurity()`. It is
called externally after deployment: in `SecurityDeploymentLib` (TREX flow), in test
fixtures, and in deployment scripts.

---

## Part A — Add new initializer call to Factory.sol

Apply when a facet processed by `initialize-add` is not yet called from
`Factory._deploySecurity()`.

### Step A1 — Determine mandatory vs optional

| Condition                                                                                                   | Pattern                                  |
| ----------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Facet appears in **every** config of this asset type (check `scripts/domain/[type]/createConfiguration.ts`) | Mandatory — direct call, no try/catch    |
| Facet appears in **some** configs only                                                                      | Optional — `_tryInitialize_Xxx()` helper |

### Step A2 — Mandatory call

Add directly in `_deploySecurity()` alongside existing mandatory calls:

```solidity
IXxx(securityAddress_).initializeXxx(_securityData.xxxParam);
```

### Step A3 — Optional call

Create a private helper and invoke it from `_deploySecurity()`:

```solidity
// In _deploySecurity():
_tryInitialize_Xxx(securityAddress_, _securityData.xxxParam);

// New private helper (near other _tryInitialize_ methods at the bottom of the file):
function _tryInitialize_Xxx(address _securityAddress, ParamType _param) private {
    try IXxx(_securityAddress).initializeXxx(_param) {
    } catch {}
}
```

### Step A4 — Import

```solidity
import { IXxx } from "../facets/xxx/IXxx.sol";
```

### Changeset for Part A

```markdown
---
"@hashgraph/asset-tokenization-contracts": minor
---

Add `initializeXxx` call to Factory deployment flow for [FacetName].
```

---

## Part B — TREX Factory: add `setOperationalStatus` loop

Apply once per asset type (Equity, Bond) to `SecurityDeploymentLib.sol`.  
File: `contracts/factory/ERC3643/libraries/core/SecurityDeploymentLib.sol`

```solidity
import { IInitializer } from "../../../facets/initializer/IInitializer.sol";

function deployEquity(...) internal returns (IToken token_) {
    _equityData.security.rbacs = _prepareRbacs(_equityData.security.rbacs, _tRexOwner);
    token_ = IToken(TRexIFactory(_atsFactory).deployEquity(_equityData, _factoryRegulationData));

    bool isOperational_ = false;
    while (!isOperational_) {
        (isOperational_, , , ) = IInitializer(address(token_)).setOperationalStatus();
    }
}
```

Apply the same change to `deployBond`.

> The TREX factory holds `DEFAULT_ADMIN_ROLE` on the deployed token — `_prepareRbacs`
> adds `address(this)` to the RBAC list. It has authority to call `setOperationalStatus()`.

> **Pre-condition**: apply Part B only after ALL facets of the equity/bond config have
> been migrated (call `setFacetToReady`). Until then the loop will never exit.

### Changeset for Part B

```markdown
---
"@hashgraph/asset-tokenization-contracts": major
---

Wire `setOperationalStatus` loop in `SecurityDeploymentLib` for [Equity/Bond] deployments
via the TREX factory. Deployed securities are now marked operational atomically after all
facets initialise.
```

---

## Part C — Config completion: `onlyOperational` + fixture + skip removal

Apply once per config type when the **last** facet of that config has been migrated.

### Step C1 — Verify all facets are migrated

Confirm every facet in `scripts/domain/[type]/createConfiguration.ts` calls
`setFacetToReady()` in its `initializeXxx`. If any facet is missing, do not proceed.

### Step C2 — Add `onlyOperational` to business functions

For every `external` function in the config's facets that is **not** `initialize`, `view`,
or `pure`, add `onlyOperational` as the **first modifier after `override`**:

```solidity
// Before
function transfer(address _to, uint256 _value)
    external
    override
    onlyActivated
    onlyUnpaused
    ...

// After
function transfer(address _to, uint256 _value)
    external
    override
    onlyOperational   // NEW — always first
    onlyActivated
    onlyUnpaused
    ...
```

`onlyOperational` is already available through `Modifiers` → `CoreModifiers` →
`InitializerModifiers`. No import needed.

**`onlyOperational` and `onlyActivated` are different guards — both must be present:**

| Modifier                                   | Guards against                          | Error                              |
| ------------------------------------------ | --------------------------------------- | ---------------------------------- |
| `onlyOperational` (`InitializerModifiers`) | Asset not yet fully initialised         | `IInitializer.AssetNotOperational` |
| `onlyActivated` (`DeactivateModifiers`)    | Asset has been irreversibly deactivated | `IDeactivate.Deactivated`          |

**Facets with only `view`/`pure` external functions receive no `onlyOperational` on any
function.** Their `initializeXxx` still runs as part of the config — `setOperationalStatus`
counts them — but their read-only functions carry no runtime operational guard.

### Step C3 — Update test fixtures

**Pre-condition**: `IInitializer` must be part of `IAsset` (the aggregated interface used
in tests). If it is not yet included, add it before proceeding:

```solidity
// In IAsset.sol — add the import and the inheritance:
import { IInitializer } from "./initializer/IInitializer.sol";

// ... existing interfaces ...
interface IAsset is IInitializer {}
```

Once `IAsset` includes `IInitializer`, call `setOperationalStatus` directly on the
typed `asset` variable — no separate factory connect needed:

```typescript
// In the fixture (e.g. test/fixtures/tokens/equity.fixture.ts):
let isOperational = false;
while (!isOperational) {
    const tx = await asset.setOperationalStatus();
    const receipt = await tx.wait();
    isOperational = receipt?.logs.some(
        (log) => /* matches OperationalStatusSet topic */
    ) ?? false;
}
```

### Step C4 — Remove migration skips

Find all `it.skip` comments containing `[MIGRATION]` that list this config's facets as
blockers. For each:

1. Remove the `.skip`
2. Remove the `// TODO: [MIGRATION] ...` comment block
3. Run the test — confirm it passes before committing

```typescript
// Before
it.skip(
    // TODO: [MIGRATION] Remove skip when all Equity config facets call setFacetToReady().
    // Blocked on: CapByPartition, ERC1410 (pending migration).
    'should deploy a fully operational equity security',
    async () => { ... }
);

// After
it('should deploy a fully operational equity security', async () => { ... });
```

### Changeset for Part C

```markdown
---
"@hashgraph/asset-tokenization-contracts": major
---

Mark [Equity/Bond/Loan] configuration as operational. All non-view/non-pure external
functions in the config now require `onlyOperational`, reverting with
`AssetNotOperational` until `setOperationalStatus()` completes successfully.
```

---

## Part D — Deployment scripts

Apply once per config type, alongside Part C.

In `scripts/domain/deploySystemWithNewBlr.ts`, add a `setOperationalStatus` loop after
every factory deployment call:

```typescript
import { IInitializer__factory } from '../typechain-types';

const initializer = IInitializer__factory.connect(deployedAddress, deployer);
let isOperational = false;
while (!isOperational) {
    const tx = await initializer.setOperationalStatus();
    const receipt = await tx.wait();
    isOperational = receipt?.logs.some(
        log => /* matches OperationalStatusSet topic */
    ) ?? false;
}
console.log(`Asset ${deployedAddress} is now operational.`);
```

---

## Verification checklist

**Part A:**

- [ ] `rg "initializeXxx" contracts/factory/Factory.sol` returns at least one match
- [ ] `npm run compile` produces 0 warnings on modified contracts
- [ ] Solhint produces no new errors on modified files
- [ ] `npm run format:check` passes on all modified files
- [ ] Mandatory / optional pattern is correct for this facet's config membership
- [ ] Changeset created

**Part B:**

- [ ] `setOperationalStatus` loop in `SecurityDeploymentLib.deployEquity`
- [ ] `setOperationalStatus` loop in `SecurityDeploymentLib.deployBond`
- [ ] TREX factory tests pass: `test/contracts/integration/factory/trex/factory.test.ts`
- [ ] `npm run compile` produces 0 warnings on modified contracts
- [ ] Solhint produces no new errors on modified files
- [ ] Changeset created

**Part C:**

- [ ] All facets in the config's `createConfiguration.ts` have been verified as migrated
- [ ] `onlyOperational` is first modifier on every non-initialize/non-view/non-pure external function
- [ ] `IInitializer` is part of `IAsset` (required for fixture to call `setOperationalStatus()` directly)
- [ ] Fixture calls `setOperationalStatus()` loop and resolves to operational
- [ ] All `it.skip([MIGRATION])` for this config removed and tests pass
- [ ] `npm run compile` produces 0 warnings on modified contracts
- [ ] Solhint produces no new errors on modified files
- [ ] `npm run format:check` passes on all modified files
- [ ] Changeset created

**Part D:**

- [ ] Deployment script includes `setOperationalStatus` loop for every factory call
- [ ] `npm run format:check` passes on modified scripts
- [ ] Changeset created
