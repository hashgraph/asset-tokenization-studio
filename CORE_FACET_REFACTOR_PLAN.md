# Refactor Plan — Core Facet

## 1. Goal

Restructure the current facet layout (split across `layer_1/`, `layer_2/`, `layer_3/`) and move to a **functional-domain** organization. This plan covers the first domain: **Core**.

The new `core/` directory groups the cross-cutting methods that define the basic identity of the token (ERC20 metadata + ERC3643 name/symbol management + version), consolidated into a single `CoreFacet` with a new initializer `initializeCore`.

## 2. Scope

### 2.1. Methods to migrate into the new `CoreFacet`

| Method             | Current facet            | Current path                                        | Origin (spec) |
| ------------------ | ------------------------ | --------------------------------------------------- | ------------- |
| `initializeCore`   | _(new)_                  | — replaces the metadata part of `initialize_ERC20`  | Core          |
| `decimals`         | `ERC20Facet`             | `facets/layer_1/ERC1400/ERC20/ERC20Facet.sol`       | ERC20         |
| `getERC20Metadata` | `ERC20Facet`             | `facets/layer_1/ERC1400/ERC20/ERC20Facet.sol`       | ERC20         |
| `name`             | `ERC20Facet`             | `facets/layer_1/ERC1400/ERC20/ERC20Facet.sol`       | ERC20         |
| `symbol`           | `ERC20Facet`             | `facets/layer_1/ERC1400/ERC20/ERC20Facet.sol`       | ERC20         |
| `setName`          | `ERC3643ManagementFacet` | `facets/layer_1/ERC3643/ERC3643ManagementFacet.sol` | ERC3643       |
| `setSymbol`        | `ERC3643ManagementFacet` | `facets/layer_1/ERC3643/ERC3643ManagementFacet.sol` | ERC3643       |
| `version`          | `ERC3643ReadFacet`       | `facets/layer_1/ERC3643/ERC3643ReadFacet.sol`       | ERC3643       |

### 2.2. Out of scope (for now)

- Remaining `ERC20` methods (`approve`, `transfer`, `transferFrom`, `allowance`, `increaseAllowance`, `decreaseAllowance`, `decimalsAt`, `initialize_ERC20`).
- Remaining `ERC3643Management` methods (`setOnchainID`, `setIdentityRegistry`, `setCompliance`, `addAgent`, `removeAgent`, `recoveryAddress`, `initialize_ERC3643`).
- Remaining `ERC3643Read` methods (`isAgent`, `identityRegistry`, `onchainID`, `compliance`, `isAddressRecovered`).

These will be covered by follow-up refactor plans when their own domains are defined (e.g. `erc20/`, `compliance/`, `agents/`).

## 3. Target structure

```
packages/ats/contracts/contracts/facets/
├── core/
│   ├── Core.sol            // abstract logic
│   ├── CoreFacet.sol       // facet with selectors + resolverKey + interfaceId
│   ├── ICore.sol           // consolidated public interface
│   └── ICoreTypes.sol      // CoreMetadata struct + events
├── layer_1/                // kept during the transition
├── layer_2/
└── layer_3/
```

Conventions (aligned with the existing `ERC3643/` and `ERC20/` layout):

- The facet implements `IStaticFunctionSelectors`.
- Inherits from `Modifiers` to reuse the existing guards (`onlyRole`, `onlyUnpaused`, ...).
- Storage is delegated to a wrapper in `domain/` — evaluate whether reusing `ERC20StorageWrapper` is enough or whether a `CoreStorageWrapper` should be extracted once `initializeCore` covers decimals + name + symbol.

## 4. Refactor steps

### Phase 0 — Preparation

1. Branch from `refactor/BBND-1458-59-60-lib-diamond-migration` (or the parent refactor branch).
2. Confirm with the team whether the `resolverKey` should be new (`_CORE_RESOLVER_KEY`) or reuse an existing one. Default is to add a new one in `constants/resolverKeys.sol`.
3. Audit `Configuration.ts` and the deployment scripts to understand how facets are registered and how their selectors are mapped (needed for step 6).

### Phase 1 — Create the new Core facet

1. Add the `_CORE_RESOLVER_KEY` constant in `contracts/constants/resolverKeys.sol`.
2. Create `facets/core/ICoreTypes.sol`:
   - `struct CoreMetadata { string name; string symbol; uint8 decimals; }`
   - Events `NameUpdated`, `SymbolUpdated` (reuse existing ones if compatible with ERC3643).
3. Create `facets/core/ICore.sol` consolidating the 8 method signatures in scope.
4. Create `facets/core/Core.sol` (abstract) with the implementation:
   - `initializeCore(CoreMetadata calldata)` → delegates into the storage wrapper(s), initializing decimals + name + symbol in a single call, replacing the metadata part of `initialize_ERC20`.
   - `decimals`, `name`, `symbol`, `getERC20Metadata` → read from `ERC20StorageWrapper`.
   - `setName`, `setSymbol` → the current `ERC3643Management` logic (respecting agent/owner modifiers).
   - `version` → the current `ERC3643Read` logic.
5. Create `facets/core/CoreFacet.sol`:
   - `getStaticResolverKey` → `_CORE_RESOLVER_KEY`.
   - `getStaticFunctionSelectors` → the 8 selectors (`initializeCore`, `decimals`, `name`, `symbol`, `getERC20Metadata`, `setName`, `setSymbol`, `version`).
   - `getStaticInterfaceIds` → `type(ICore).interfaceId`.

### Phase 2 — Remove the methods from the source facets

1. `ERC20Facet.sol` / `ERC20.sol` / `IERC20.sol`:
   - Remove `name`, `symbol`, `decimals`, `getERC20Metadata` from the facet's public surface.
   - Update `getStaticFunctionSelectors` (shrinks from 12 to 8) and rebuild the array.
   - Decide the fate of `initialize_ERC20`: if it is still required for non-Core flows, keep it; if `initializeCore` fully covers it, remove it and update scripts/tests accordingly.
2. `ERC3643ManagementFacet.sol` / `ERC3643Management.sol` / `IERC3643Management.sol`:
   - Remove `setName`, `setSymbol`.
   - Update `getStaticFunctionSelectors` (shrinks from 9 to 7).
3. `ERC3643ReadFacet.sol` / `ERC3643Read.sol` / `IERC3643Read.sol`:
   - Remove `version`.
   - Update `getStaticFunctionSelectors` (shrinks from 6 to 5).
4. Leave every other selector and function untouched.

### Phase 3 — Register `CoreFacet` in the diamond

1. Add `CoreFacet` in `Configuration.ts` and in any deployment script under `scripts/` that loads selectors by `resolverKey`.
2. Update the `BusinessLogicResolver` (or equivalent) to include `_CORE_RESOLVER_KEY`.
3. Review `deployments/` and precompiled artifacts: regenerate if needed.
4. Review `ICore` and the ERC-165 `interfaceId` registrations.

### Phase 4 — SDK (explicit human review required — see `MEMORY.md`)

1. Do not touch `packages/ats/sdk` autonomously. Open a separate task/PR describing:
   - The new `CoreFacet` and its methods.
   - Which selectors are leaving `ERC20` / `ERC3643Management` / `ERC3643Read`.
2. Wait for human validation before regenerating SDK typings, clients, or commands.

### Phase 5 — Tests

1. Move the existing test cases that currently live under:
   - `test/.../ERC20/*` — the ones covering name/symbol/decimals/getERC20Metadata → `test/.../core/`.
   - `test/.../ERC3643/management/*` — the ones for setName/setSymbol → `test/.../core/`.
   - `test/.../ERC3643/read/*` — the one for version → `test/.../core/`.
2. Add new tests:
   - `initializeCore` happy path and re-initialization blocked.
   - Interop: callers that previously reached `name()` through `ERC20Facet` still work through the diamond.
3. Review hardhat fixtures (`deployer`, `user1`, ...) and the ethers v6 conventions already migrated.

### Phase 6 — Documentation

1. Update `docs/` (including the search bar introduced in `5968e9f05`) with:
   - A new "Core Facet" section.
   - Deprecation notes in the ERC20 and ERC3643 sections describing the move.
2. Add an entry to `packages/ats/contracts/CHANGELOG.md`.

## 5. Technical considerations

- **Selector collision**: selectors for `name`, `symbol`, `decimals`, `setName`, `setSymbol`, `version`, `getERC20Metadata` do not change (same signature). When registering them under a new `resolverKey`, they **must be removed from the previous resolverKey** to avoid the diamond routing them to two different implementations.
- **Storage**: no storage is moved or renamed. `ERC20StorageWrapper` remains the source of truth for name/symbol/decimals. Only the location of the external function changes.
- **Diamond backwards compatibility**: existing on-chain upgrades will need a selector-mapping migration. Document it in the migration script.
- **Events**: if `setName` / `setSymbol` emitted events in the ERC3643 namespace, decide whether to rename them to `CoreNameUpdated` or keep them for binary compat (likely keep).
- **`initialize_ERC20` vs `initializeCore`**: decide with the team whether they coexist during the transition or whether `initializeCore` fully replaces the metadata part. Recommendation: full replacement to avoid two entry points writing to the same storage.

## 6. Acceptance criteria

- [ ] `facets/core/` directory created with `CoreFacet`, `Core`, `ICore`, `ICoreTypes`.
- [ ] The 8 selectors in scope respond through `CoreFacet` and have been removed from their source facets.
- [ ] `_CORE_RESOLVER_KEY` registered and mapped in the deployment configuration.
- [ ] Existing tests still pass with no change in observable public ABI (same selectors respond with the same semantics).
- [ ] New tests added for `initializeCore` and the Core routing path.
- [ ] Documentation and CHANGELOG updated.
- [ ] SDK **NOT** modified autonomously; SDK PR opened and pending human review.

## 7. Risks and mitigations

| Risk                                                 | Mitigation                                                                                              |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Duplicate selector across two different resolverKeys | Review checklist + integration test hitting the diamond to verify the selector resolves to `CoreFacet`. |
| Breaking existing deployments (upgrade path)         | Explicit migration script + dry-run on a test network.                                                  |
| SDK divergence                                       | Block merge until the SDK PR is manually reviewed.                                                      |
| Tests coupled to `ERC20Facet` / `ERC3643Facet` paths | Global search and migration in Phase 5 before opening the PR.                                           |

## 8. Next domains (suggested roadmap, out of this PR)

Once the pattern is validated with `core/`, replicate it for:

- `erc20/` (the rest of ERC20: approve/transfer/allowance...).
- `compliance/` (ERC3643 agents, compliance, identity registry).
- `partitions/`, `hold/`, `lock/`, `freeze/`, ... following the current `layer_1/` folders.

This progressively eliminates the `layer_1/2/3/` hierarchy and replaces it with functional domains.
