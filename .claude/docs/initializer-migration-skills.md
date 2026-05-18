# AI Skills: Initializer Migration Automation

This document describes the four Claude Code skills added to `.claude/skills/` that automate
the migration of facet initialisation from the per-facet boolean guard pattern to the
centralised `InitializerStorageWrapper` pattern.

---

## Why

The migration touches ~18 storage structs, ~15+ facets, `Factory.sol`, `TREXFactory`,
deployment scripts, and test fixtures. Each step has non-obvious correctness constraints:

- **Storage layout safety** when removing `bool initialized` fields from structs
- **Modifier ordering** (`onlyFacetNotRegistered` before `onlyRole` before business guards)
- **Event signature rules** (`address indexed operator` always first)
- **CI strategy** for integration tests that span multiple facets

These skills encode the analysis and decisions made upfront so the team can apply them
consistently without re-deriving the rules for each facet.

---

## Skills

| Skill                            | Input                                    | What it does                                                                                                                                                                                                |
| -------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/initialize-update <file>`      | Facet with existing `initializeXxx`      | Replaces old boolean guard with `onlyFacetNotRegistered` + `onlyRole`, handles storage struct safely, adds `setFacetToReady`, fixes event, updates Factory + TypeScript                                     |
| `/initialize-add <file>`         | Facet without `initializeXxx`            | Creates event + function in interface, implements body, registers selector in `getStaticFunctionSelectors`                                                                                                  |
| `/initialize-event-check <file>` | Any facet after migration                | Audits and auto-fixes event signature, NatSpec, emit position, and `operator` param                                                                                                                         |
| `/initialize-factory <config>`   | Config name (`Equity` / `Bond` / `Loan`) | Adds new initializer calls to Factory, wires `setOperationalStatus` loop in TREXFactory, adds `onlyOperational` to business functions, updates fixtures and removes migration skips when config is complete |

---

## Workflow

```
Per facet with existing initializer:
  /initialize-update <file>  →  /initialize-event-check <file>

Per facet without initializer:
  /initialize-add <file>  →  /initialize-event-check <file>

When the last facet of a config is merged:
  /initialize-factory Equity   (or Bond / Loan)
```

### Example

```bash
# Migrate Cap facet (has existing initializer)
/initialize-update packages/ats/contracts/contracts/facets/cap/Cap.sol

# Add initializer to Allowance facet (has none)
/initialize-add packages/ats/contracts/contracts/facets/allowance/Allowance.sol

# Verify event emission on any facet
/initialize-event-check packages/ats/contracts/contracts/facets/cap/Cap.sol

# Close out the Equity config once all its facets are done
/initialize-factory Equity
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

`/initialize-factory` handles this as its final step, coordinated with the fixture update.

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
config via `/initialize-factory`.

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
