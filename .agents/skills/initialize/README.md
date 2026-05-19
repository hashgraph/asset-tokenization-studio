# AI Skills: Initializer Migration Automation

This document describes the `initialize` AI skill added to `.agents/skills/initialize/` that
automates the migration of facet initialisation from the per-facet boolean guard pattern to the
centralised `InitializerStorageWrapper` pattern.

---

## Why

The migration touches ~18 storage structs, ~15+ facets, `Factory.sol`, `TREXFactory`,
deployment scripts, and test fixtures. Each step has non-obvious correctness constraints:

- **Storage layout safety** when removing `bool initialized` fields from structs
- **Modifier ordering** (`onlyFacetNotRegistered` before `onlyRole` before business guards)
- **Event signature rules** (`address indexed operator` always first)
- **CI strategy** for integration tests that span multiple facets

The skill encodes the analysis and decisions made upfront so the team can apply them
consistently without re-deriving the rules for each facet.

---

## Skill Structure

The skill lives at `.agents/skills/initialize/` and is composed of an orchestrator and four
workflow files:

```
.agents/skills/initialize/
  SKILL.md                ← orchestrator: introspects the facet and dispatches
  workflows/
    ADD.md                ← adds a new initializeXxx from scratch
    UPDATE.md             ← migrates old boolean-guard init to centralised pattern
    FACTORY.md            ← wires Factory.sol, TREXFactory, scripts, and fixtures
    EVENT_CHECK.md        ← audits and fixes init event emission
```

### How it works

You always invoke `/initialize <file>` (or describe the task in natural language). The skill
reads `SKILL.md`, introspects the target facet, and decides which workflow to apply using the
decision matrix below. You never need to pick a workflow manually.

---

## Decision Matrix

| Situation                                                                           | Workflow applied           |
| ----------------------------------------------------------------------------------- | -------------------------- |
| Facet has **no** `initXxx` but has a `_RESOLVER_KEY`                                | `workflows/ADD.md`         |
| Facet has `initXxx` using old boolean guard (`onlyNotXxxInitialised`)               | `workflows/UPDATE.md`      |
| Factory needs to call newly-added/migrated `initXxx`; or a config is fully migrated | `workflows/FACTORY.md`     |
| Event emission in `initXxx` is missing or malformed                                 | `workflows/EVENT_CHECK.md` |

---

## Workflow

```
Per facet with existing initializer:
  /initialize <file>            → runs UPDATE → EVENT_CHECK

Per facet without initializer:
  /initialize <file>            → runs ADD → EVENT_CHECK

When the last facet of a config is merged:
  /initialize <config>          → runs FACTORY (Part C + D)
```

### Examples

```bash
# Migrate Cap facet (has existing initializer — runs UPDATE + EVENT_CHECK)
/initialize packages/ats/contracts/contracts/facets/cap/Cap.sol

# Add initializer to Allowance facet (has none — runs ADD + EVENT_CHECK)
/initialize packages/ats/contracts/contracts/facets/allowance/Allowance.sol

# Audit event emission only (safe to run standalone)
/initialize packages/ats/contracts/contracts/facets/cap/Cap.sol
# → if already migrated, skill runs EVENT_CHECK directly

# Close out the Equity config once all its facets are done
/initialize Equity
```

---

## Key decisions encoded in the skills

### Storage struct cleanup

`bool initialized` is deleted unconditionally from every storage struct.
This migration intentionally breaks storage backward compatibility — no renaming or
deprecation shims.

### `onlyOperational` is a per-config action

`onlyOperational` is added to business functions only when **all** facets of a config have
been migrated. Adding it per-facet would break the entire config's integration test suite
immediately, since `setOperationalStatus()` cannot complete until every facet calls
`setFacetToReady()`.

`workflows/FACTORY.md` Part C handles this, coordinated with the fixture update.

### `onlyActivated` vs `onlyOperational`

These are two independent guards that must both be present on business functions:

| Modifier          | File                       | Guards against                                                         |
| ----------------- | -------------------------- | ---------------------------------------------------------------------- |
| `onlyOperational` | `InitializerModifiers.sol` | Asset not yet fully initialised — reverts with `AssetNotOperational`   |
| `onlyActivated`   | `DeactivateModifiers.sol`  | Asset has been deactivated (irreversible) — reverts with `Deactivated` |

### CI strategy for integration tests

Tests that span a full config are skipped during the migration window using:

```typescript
it.skip(
    // TODO: [MIGRATION] Remove skip when all Equity config facets call setFacetToReady().
    // Blocked on: CapByPartition, ERC1410 (pending migration).
    // Tracking: https://github.com/hashgraph/asset-tokenization-studio/issues/XXXX
    'should deploy a fully operational equity security',
    async () => { ... }
);
```

The PR that migrates the last facet of a config removes all `[MIGRATION]` skips for that
config via `workflows/FACTORY.md`.

### TREX Factory

`TREXFactoryAts` delegates deployment to `SecurityDeploymentLib`, which calls the ATS
`Factory.sol`. The `setOperationalStatus()` loop is added to `SecurityDeploymentLib`
(not to `TREXFactoryAts` directly) so that both `deployEquity` and `deployBond` benefit
from the same fix. The library holds `DEFAULT_ADMIN_ROLE` on deployed tokens via
`_prepareRbacs`, so it has authority to call `setOperationalStatus()`.

---

## Event signature contract

Every `initializeXxx` function must emit a `[FacetName]Initialized` event with this shape:

```solidity
// In the interface (IXxx.sol):
event XxxInitialized(
    address indexed operator,   // always first — from EvmAccessors.getMsgSender()
    ParamType1 param1,          // same params as the function, without calldata/memory
    ParamType2 param2
);

// In the implementation:
emit XxxInitialized(EvmAccessors.getMsgSender(), param1, param2);
```

Functions with no input parameters emit `event XxxInitialized(address indexed operator)`
— the operator is never omitted.

---

## Modifier order

```solidity
function initializeXxx(...)
    external
    override
    onlyFacetNotRegistered(_XXX_RESOLVER_KEY)   // 1st — registration guard
    onlyRole(DEFAULT_ADMIN_ROLE)                 // 2nd — access control
    onlyExistingBusinessModifier(...)            // 3rd+ — existing business guards
{
    XxxStorageWrapper.initializeXxx(...);
    InitializerStorageWrapper.setFacetToReady(_XXX_RESOLVER_KEY);
    emit XxxInitialized(EvmAccessors.getMsgSender(), ...);
}
```

---

## Required imports (relative paths from a facet in `contracts/facets/xxx/`)

```solidity
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { _XXX_RESOLVER_KEY } from "../../constants/resolverKeys.sol";
```

`onlyFacetNotRegistered` and `onlyRole` require no new imports — they are available through
`Modifiers` → `CoreModifiers` → `InitializerModifiers` / `AccessControlModifiers`.
