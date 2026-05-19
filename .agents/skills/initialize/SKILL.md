---
name: initialize
description: >
  Orchestrates facet initialisation workflows. Introspects a facet and decides which workflow to apply:
  `initialize-add`, `initialize-update`, `initialize-factory`, or `initialize-event-check`.
  Trigger: when the user mentions any initialise-related task on a facet, or says "initialise",
  "add init", "migrate init", "fix init event", "wire factory init", or "add onlyOperational".
license: Apache-2.0
metadata:
  author: Asset Tokenization Studio Team
  version: "1.0.1"
---

## When to Use

- User wants to add an `init` function to a facet that lacks one.
- User wants to migrate an existing `init` from old boolean-guard pattern to centralised `InitializerStorageWrapper`.
- User wants to wire factory calls for a newly-init-enabled facet.
- User wants to validate or fix event emission in an `init` function.
- User wants to add `onlyOperational` once all facets of a config are migrated (handled by `initialize-factory` Part C).

## Decision Matrix

| Situation                                                                         | Workflow                   | Condition                                                                                                                                                        |
| --------------------------------------------------------------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Facet has NO `init` function but HAS a resolver key                               | `workflows/ADD.md`         | No `initXxx`, `_RESOLVER_KEY` exists in `resolverKeys.sol`                                                                                                       |
| Facet has `init` using old boolean guard (`onlyNotXxxInitialised`)                | `workflows/UPDATE.md`      | `initXxx` exists + boolean guard + needs centralisation                                                                                                          |
| Factory needs to call newly-added/migrated `initXxx`, or config is fully migrated | `workflows/FACTORY.md`     | After one or more facets processed by `initialize-add` or `initialize-update`; or all facets in a config have centralised `init` (Part C adds `onlyOperational`) |
| Event emission in `initXxx` is missing or malformed                               | `workflows/EVENT_CHECK.md` | After `initialize-add` or `initialize-update`; also valid as a standalone audit sweep across `contracts/facets/`                                                 |

## Introspection Checklist

Before choosing a workflow, answer these about the target facet:

1. **Does a resolver key exist?**
   - Search `contracts/constants/resolverKeys.sol` for `_[FACET_NAME_SCREAMING_SNAKE]_RESOLVER_KEY`
   - If NOT found → stop and ask the team to add one.

2. **Does an `init` function already exist?**
   - Search the abstract contract (e.g., `Cap.sol`) for `function initialize`
   - If NOT found → `workflows/ADD.md`
   - If FOUND → check if it uses `onlyNotXxxInitialised` boolean guard

3. **Is the `init` pattern old or new?**
   - Uses `onlyNotXxxInitialised` or equivalent per-facet boolean → **Old** → `workflows/UPDATE.md`
   - Uses `onlyFacetNotRegistered(_XXX_RESOLVER_KEY)` → **New** → already migrated for this facet
   - No `InitializerStorageWrapper.setFacetToReady` call → **Old** → `workflows/UPDATE.md`

4. **Does Factory.sol already call `initializeXxx`?**
   - Search `contracts/factory/Factory.sol` for the facet's `initializeXxx` call
   - If NOT found after the facet's init is new-pattern → `workflows/FACTORY.md` Part A needs to run

5. **What is the parent relationship?**
   - Does the facet derive from another with `init`?
   - If parent has `init` and child doesn't add new state → child likely inherits parent's `init`; verify before adding a duplicate

## Commands

```bash
# Check if a resolver key exists (replace CAP_BY_PARTITION with the actual SCREAMING_SNAKE name)
rg "CAP_BY_PARTITION_RESOLVER_KEY" contracts/constants/resolverKeys.sol

# Check if an init function exists in the facet (replace path with actual facet path)
rg "function initialize" contracts/facets/cap/Cap.sol

# Check if the old boolean-guard pattern is present
rg "onlyNot.*Initialized" contracts/facets/cap

# Check if Factory.sol already calls initializeXxx (replace initializeCap with actual name)
rg "initializeCap" contracts/factory/Factory.sol

# List all facets registered in a config (replace Equity with Bond or Loan as needed)
rg "FACET" contracts/services/configurations/EquityConfiguration.sol
```

## Resources

- `workflows/ADD.md` — add a new `initializeXxx` from scratch
- `workflows/UPDATE.md` — migrate old boolean-guard init to centralised pattern
- `workflows/FACTORY.md` — wire factory calls; also covers `onlyOperational` (Part C) and deployment scripts (Part D)
- `workflows/EVENT_CHECK.md` — audit and fix init event emission (safe to run standalone or after any add/update)

## Output

This skill produces a **decision** and applies the appropriate workflow.
If the decision is ambiguous or conditions are not met, ask for clarification before proceeding.
