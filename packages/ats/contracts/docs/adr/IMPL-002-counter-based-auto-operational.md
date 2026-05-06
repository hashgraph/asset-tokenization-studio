# Implementation Guide — ADR-002: Counter-Based Auto-Operational Activation

> **Branch**: `poc/BBND-auto-operational-counter`
> **ADR**: `docs/adr/ADR-002-counter-based-auto-operational.md`

---

## Context

Eliminate manual operator calls after initialization/upgrade by hooking a shared
`_prepareReinitialization` into the three existing `IDiamondCut` methods and into the
asset constructor flow. The BLR pre-computes diffs; the asset counts facets to zero and
self-activates.

**Key codebase discoveries:**

- `updateConfigVersion`, `updateConfig`, `updateResolver` already exist in `DiamondCut.sol`
  — they call `_updateVersion` / `_updateConfigId` / `_updateResolver` but do **not** call
  `_prepareReinitialization` yet. This is the hook point.
- `InitializerDataStorage` already has `configVersionStatus`, `configInitializedCount`,
  `configTargetCount` keyed by `(configId, versionId)`. Storage layout is preserved.
- `_tryAutoActivate()` already exists — needs one line added to write `lastOperationalVersion`.
- `computeTransitionDiff` and `getTransitionDiff` do not exist yet — full addition required.

---

## Quality Mandatories

All must pass before the PR is opened. No exceptions.

| Mandatory                                               | Verification                                                            |
| ------------------------------------------------------- | ----------------------------------------------------------------------- |
| NatSpec on every `public`/`external` function and event | Manual review — zero missing tags                                       |
| `++i` everywhere (no `i++`)                             | `rg 'i\+\+\|index\+\+\|j\+\+' contracts/` — zero results in new code    |
| No single-use local variables                           | Manual review per function                                              |
| `if (cond) revert TypedError(args)` — no `require`      | Manual review — library-compatible with all Solidity `>=0.8.0` versions |
| Formatting                                              | `npm run format` — zero diff                                            |
| Linting                                                 | `npm run lint` — zero new errors or warnings                            |
| Compilation                                             | `npx hardhat compile --force` — zero new warnings                       |
| Tests passing                                           | `npx hardhat test --no-compile` — all green                             |
| Coverage ≥ baseline                                     | `npx hardhat coverage` — no regression                                  |

---

## Critical Files

| File                                                                                  | Action                                                                                                                                                             |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `contracts/domain/core/InitializerStorageWrapper.sol`                                 | Extend struct · add `_prepareReinitialization` · update `_tryAutoActivate`                                                                                         |
| `contracts/facets/initializer/IInitializer.sol`                                       | Add three new typed errors (`TransitionDiffNotRegistered`, `AlreadyPendingReinitialization`, `StillPending`)                                                       |
| `contracts/infrastructure/diamond/IDiamondCutManager.sol`                             | Add event + `computeTransitionDiff` + `getTransitionDiff`                                                                                                          |
| `contracts/infrastructure/diamond/DiamondCutManagerWrapper.sol`                       | Extend storage + implement new internal functions                                                                                                                  |
| `contracts/infrastructure/diamond/DiamondCutManager.sol`                              | Expose new interface functions                                                                                                                                     |
| `contracts/infrastructure/diamond/DiamondCut.sol`                                     | Hook `_prepareReinitialization` into all three methods                                                                                                             |
| `contracts/infrastructure/proxy/ResolverProxy.sol`                                    | Hook `_prepareReinitialization` into `_initialize`                                                                                                                 |
| `contracts/services/core/InitializerModifiers.sol`                                    | Update `onlyFacetNotReady` and `onlyFacetRegistered` to use composite keys (`_buildFacetStateKey`, `_buildFacetContextKey`). `onlyOperational` requires no change. |
| `contracts/test/mocks/GasBenchmarkInitializerHarness.sol`                             | Extend for `_prepareReinitialization` bench                                                                                                                        |
| `test/contracts/unit/layer_1/gasBenchmarkInitializer/gasBenchmarkInitializer.test.ts` | Extend with new scenarios                                                                                                                                          |

---

## Implementation Phases

Execute in order. Each phase must compile cleanly before advancing to the next.

---

### Phase 1 — Storage Extensions (non-breaking)

**`contracts/domain/core/InitializerStorageWrapper.sol`**

Add one field to `InitializerDataStorage` **at the end of the struct** to preserve
existing slot layout:

```solidity
uint256 lastOperationalVersion;  // version last emitted as TokenOperational
```

`configVersionStatus`, `configInitializedCount`, `configTargetCount` keep their existing
`(configId, versionId)` composite keys — **do not change them**.

The existing `facetVersionStatus` and `facetLastVersion` mappings change their key scheme:

- `facetVersionStatus`: key = `keccak256(abi.encodePacked(resolver, configId, facetId, facetVersion))`
- `facetLastVersion`: key = `keccak256(abi.encodePacked(resolver, configId, facetId))`

Add two private pure helpers to compute these keys:

```solidity
function _buildFacetStateKey(
  address _resolver,
  bytes32 _configId,
  bytes32 _facetId,
  uint256 _facetVersion
) private pure returns (bytes32 key_) {
  key_ = keccak256(abi.encodePacked(_resolver, _configId, _facetId, _facetVersion));
}

function _buildFacetContextKey(
  address _resolver,
  bytes32 _configId,
  bytes32 _facetId
) private pure returns (bytes32 key_) {
  key_ = keccak256(abi.encodePacked(_resolver, _configId, _facetId));
}
```

These helpers are used in `setFacetToReady` and the modifier checks.

**`contracts/facets/initializer/IInitializer.sol`**

Add two typed errors:

```solidity
/// @notice Thrown when _prepareReinitialization is called but the BLR diff is not registered.
/// @param configId Configuration identifier.
/// @param from Source version.
/// @param to Target version.
error TransitionDiffNotRegistered(bytes32 fromConfigId, uint256 fromVersion, bytes32 toConfigId, uint256 toVersion);

/// @notice Thrown when _prepareReinitialization is called while a reinitialization is pending.
/// @param configId Configuration identifier.
/// @param pendingVersion Version currently pending initialization.
error AlreadyPendingReinitialization(bytes32 configId, uint256 pendingVersion);
```

**Verification**: `npx hardhat compile --force` — zero new warnings.

---

### Phase 2 — BLR Interface + Storage

**`contracts/infrastructure/diamond/IDiamondCutManager.sol`**

Add after the existing interface members:

```solidity
/// @notice Emitted when a transition diff is registered, automatically or manually.
/// @param fromConfigId  Source configuration identifier (bytes32(0) for fresh deploy).
/// @param fromVersion   Source version (0 for fresh deploy).
/// @param toConfigId    Target configuration identifier.
/// @param toVersion     Target version.
/// @param totalFacets    Total facets in `toConfigId`/`toVersion`.
/// @param unchangedFacets Facets identical between source and target.
event TransitionDiffRegistered(
  bytes32 indexed fromConfigId,
  uint256 fromVersion,
  bytes32 indexed toConfigId,
  uint256 toVersion,
  uint256 totalFacets,
  uint256 unchangedFacets
);

/// @notice Pre-compute and store the diff between two config versions.
/// @dev Called automatically on sequential createConfiguration.
///      For non-sequential upgrades or cross-config transitions
///      the admin must call this explicitly BEFORE updateConfigVersion/updateConfig/updateResolver.
/// @param _fromConfigId Source configuration identifier. bytes32(0) for fresh deploy.
/// @param _fromVersion  Source version. 0 for fresh deploy.
/// @param _toConfigId   Target configuration identifier.
/// @param _toVersion    Target version. Must be <= latestVersion[_toConfigId].
function computeTransitionDiff(
  bytes32 _fromConfigId,
  uint256 _fromVersion,
  bytes32 _toConfigId,
  uint256 _toVersion
) external;

/// @notice Returns the pre-computed diff between two config versions.
/// @param _fromConfigId   Source configuration identifier.
/// @param _fromVersion    Source version.
/// @param _toConfigId     Target configuration identifier.
/// @param _toVersion      Target version.
/// @return totalFacets_    Total facets in `_toConfigId`/`_toVersion`.
/// @return unchangedFacets_ Facets identical between source and target.
/// @return isRegistered_   False when the diff has not been pre-computed yet.
function getTransitionDiff(
  bytes32 _fromConfigId,
  uint256 _fromVersion,
  bytes32 _toConfigId,
  uint256 _toVersion
) external view returns (uint256 totalFacets_, uint256 unchangedFacets_, bool isRegistered_);
```

**`contracts/infrastructure/diamond/DiamondCutManagerWrapper.sol`**

Extend `DiamondCutManagerStorage` — add at the end of the struct:

```solidity
// keccak256(abi.encodePacked(fromConfigId, fromVersion, toConfigId, toVersion))
mapping(bytes32 transitionHash => uint256 totalFacets)     transitionTotalCount;
mapping(bytes32 transitionHash => uint256 unchangedFacets) transitionUnchangedCount;
mapping(bytes32 transitionHash => bool registered)         transitionRegistered;
```

Add private helper following the existing `_buildHash` pattern:

```solidity
function _buildTransitionHash(
  bytes32 _fromConfigId,
  uint256 _fromVersion,
  bytes32 _toConfigId,
  uint256 _toVersion
) private pure returns (bytes32 hash_) {
  hash_ = keccak256(abi.encodePacked(_fromConfigId, _fromVersion, _toConfigId, _toVersion));
}
```

Add `_computeTransitionDiff` internal function:

```
_computeTransitionDiff(bytes32 fromConfigId, uint256 fromVersion, bytes32 toConfigId, uint256 toVersion):
  1. Validate toVersion <= latestVersion[toConfigId]
       → revert ResolverProxyConfigurationNoRegistered(toConfigId, toVersion) if invalid
  2. Validate fromVersion == 0 || fromVersion < toVersion
       → revert ResolverProxyConfigurationNoRegistered(toConfigId, toVersion) if invalid (downgrade)
  3. if fromVersion == 0:
       totalFacets = facetIds[_buildHash(toConfigId, toVersion)].length
       unchangedFacets = 0
  4. else:
       iterate facetIds in 'to' (existing array: facetIds[_buildHash(toConfigId, toVersion)])
       for each facetId:
         pos = facetIdPosition[_buildHash(fromConfigId, fromVersion, facetId)]
         if pos == 0: facet is new → skip (counts toward K)
         else:
           facetVersionInFrom = facetVersions[_buildHash(fromConfigId, fromVersion)][pos - 1]
           facetVersionInTo   = facetVersions[_buildHash(toConfigId, toVersion)][index]
           if facetVersionInFrom == facetVersionInTo: unchangedFacets++
       totalFacets = facetIds[_buildHash(toConfigId, toVersion)].length
  5. store transitionTotalCount, transitionUnchangedCount, transitionRegistered = true
  6. emit TransitionDiffRegistered
```

Loop pattern (existing convention):

```solidity
for (uint256 index; index < length; ) {
    // logic
    unchecked { ++index; }
}
```

Hook into `_activateConfiguration` — capture `prevVersion` before the latestVersion
assignment, then call `_computeTransitionDiff` after:

```solidity
function _activateConfiguration(bytes32 _configurationId, bool _isLastBatch) internal {
  if (!_isLastBatch) return;
  DiamondCutManagerStorage storage _dcms = _diamondCutManagerStorage();
  if (!_dcms.activeConfigurations[_configurationId]) {
    _dcms.configurations.push(_configurationId);
    _dcms.activeConfigurations[_configurationId] = true;
  }
  uint256 prevVersion_ = _dcms.latestVersion[_configurationId]; // capture before update
  _dcms.latestVersion[_configurationId] = _dcms.batchVersion[_configurationId];
  delete _dcms.batchVersion[_configurationId];
  _computeTransitionDiff(_configurationId, prevVersion_, _configurationId, _dcms.latestVersion[_configurationId]);
}
```

Add `_getTransitionDiff` internal view function returning the three values.

**`contracts/infrastructure/diamond/DiamondCutManager.sol`**

Expose both new interface functions. Follow `@inheritdoc IDiamondCutManager` pattern.

**Verification**: `npx hardhat compile --force` — zero new warnings.

---

### Phase 3 — `_prepareReinitialization`

**`contracts/domain/core/InitializerStorageWrapper.sol`**

Add internal function. Import `IDiamondCutManager` at the top of the file.

```
_prepareReinitialization(bytes32 fromConfigId, uint256 fromVersion, bytes32 toConfigId, uint256 toVersion, IDiamondCutManager blr):

  1. (totalFacets_, unchangedFacets_, isRegistered_) = blr.getTransitionDiff(fromConfigId, fromVersion, toConfigId, toVersion)
  2. if !isRegistered_
       → revert IInitializer.TransitionDiffNotRegistered(fromConfigId, fromVersion, toConfigId, toVersion)
  3. if initializer.configVersionStatus[toConfigId][toVersion] == _REINIT_PENDING
       → revert IInitializer.AlreadyPendingReinitialization(toConfigId, toVersion)
  4. uint256 K_ = totalFacets_ - unchangedFacets_
  5. if K_ == 0:
       initializer.lastOperationalVersion = toVersion
       initializer.configVersionStatus[toConfigId][toVersion] = 1
       emit IInitializer.TokenOperational(toConfigId, toVersion)
       return
  6. initializer.configTargetCount[toConfigId][toVersion] = K_
  7. initializer.configInitializedCount[toConfigId][toVersion] = 0
  8. initializer.configVersionStatus[toConfigId][toVersion] = _REINIT_PENDING
```

**Pending sentinel** — add constant to `InitializerStorageWrapper`:

```solidity
uint256 private constant _REINIT_PENDING = type(uint256).max;
```

`type(uint256).max` cannot be a valid resume index (would require 2²⁵⁶ − 2 facets).
Verify `_tryAutoActivate` and `setOperationalStatus` do not read this value as a resume
index. The existing check in `_tryAutoActivate` is `if (target == 0) return` — confirm
`_REINIT_PENDING` does not satisfy that condition (it does not: `type(uint256).max != 0`).

**Update `_tryAutoActivate`** — add one line after `emit TokenOperational`:

```solidity
initializer_.lastOperationalVersion = versionId;
```

Note: `setFacetToReady` (called by facets) must compute facet keys using `_buildFacetStateKey` and `_buildFacetContextKey` passing `address(ds.resolver)` and `ds.resolverProxyConfigurationId` from `ResolverProxyStorageWrapper.resolverProxyStorage()`.

**Verification**: `npx hardhat compile --force` — zero new warnings.

---

### Phase 4 — Hook into DiamondCut + ResolverProxy

**`contracts/infrastructure/diamond/DiamondCut.sol`**

In `updateConfigVersion`, capture current state, call `_prepareReinitialization` FIRST
(reentrancy mitigation — see Annex H.2), THEN update the proxy storage:

```solidity
function updateConfigVersion(uint256 _newVersion) external override onlyRole(DEFAULT_ADMIN_ROLE) {
  ResolverProxyStorage storage ds = ResolverProxyStorageWrapper.resolverProxyStorage();
  ds.resolver.checkResolverProxyConfigurationRegistered(ds.resolverProxyConfigurationId, _newVersion);
  bytes32 configId_ = ds.resolverProxyConfigurationId;
  // Use lastOperationalVersion, not ds.version: if a prior upgrade is pending,
  // ds.version already points to the pending version but the diff must start
  // from the last confirmed operational state.
  uint256 fromVersion_ = InitializerStorageWrapper.initializerStorage().lastOperationalVersion;
  InitializerStorageWrapper._prepareReinitialization(
    configId_,
    fromVersion_,
    configId_,
    _newVersion,
    IDiamondCutManager(address(ds.resolver))
  );
  _updateVersion(ds, _newVersion);
}
```

Apply same pattern to `updateConfig`:

```solidity
function updateConfig(bytes32 _newConfigurationId, uint256 _newVersion) external override onlyRole(DEFAULT_ADMIN_ROLE) {
  ResolverProxyStorage storage ds = ResolverProxyStorageWrapper.resolverProxyStorage();
  ds.resolver.checkResolverProxyConfigurationRegistered(_newConfigurationId, _newVersion);
  bytes32 currentConfigId_ = ds.resolverProxyConfigurationId;
  uint256 fromVersion_ = InitializerStorageWrapper.initializerStorage().lastOperationalVersion;
  InitializerStorageWrapper._prepareReinitialization(
    currentConfigId_,
    fromVersion_,
    _newConfigurationId,
    _newVersion,
    IDiamondCutManager(address(ds.resolver))
  );
  _updateConfigId(ds, _newConfigurationId);
  _updateVersion(ds, _newVersion);
}
```

**`updateResolver` restriction**: The new resolver has no knowledge of the old configId.
The transition MUST be treated as a fresh deploy: `fromConfigId = bytes32(0), fromVersion = 0`.
`_prepareReinitialization` MAY be called before `_updateVersion` (see reentrancy mitigation
in Annex H.2):

```solidity
function updateResolver(
  IBusinessLogicResolver _newResolver,
  bytes32 _newConfigurationId,
  uint256 _newVersion
) external override onlyRole(DEFAULT_ADMIN_ROLE) {
  _newResolver.checkResolverProxyConfigurationRegistered(_newConfigurationId, _newVersion);
  InitializerStorageWrapper._prepareReinitialization(
    bytes32(0),
    0,
    _newConfigurationId,
    _newVersion,
    IDiamondCutManager(address(_newResolver))
  );
  ResolverProxyStorage storage ds = ResolverProxyStorageWrapper.resolverProxyStorage();
  _updateResolver(ds, _newResolver);
  _updateConfigId(ds, _newConfigurationId);
  _updateVersion(ds, _newVersion);
}
```

**`contracts/infrastructure/proxy/ResolverProxy.sol`**

In `_initialize`, call `_prepareReinitialization` AFTER storage is written:

```solidity
InitializerStorageWrapper._prepareReinitialization(
    bytes32(0),
    0,
    _resolverProxyConfigurationId,
    _version,
    IDiamondCutManager(address(_resolver))
);
```

**Verification**: `npx hardhat compile --force` — zero new warnings. Existing tests still pass.

---

### Phase 4.5 — StillPending Guard at `update*` Entry Points

**`contracts/facets/initializer/IInitializer.sol`**

Add one new typed error:

```solidity
/// @notice Thrown when an update method is called while the current version has pending initialization.
/// @param configId Current configuration identifier.
/// @param version  Current version still pending.
error StillPending(bytes32 configId, uint256 version);
```

**`contracts/infrastructure/diamond/DiamondCut.sol`**

Add the following check at the START of `updateConfigVersion`, `updateConfig`, and `updateResolver`, before any other logic:

```solidity
ResolverProxyStorage storage ds_ = ResolverProxyStorageWrapper.resolverProxyStorage();
InitializerDataStorage storage init_ = InitializerStorageWrapper.initializerStorage();
if (init_.configVersionStatus[ds_.resolverProxyConfigurationId][ds_.version] != 1)
    revert IInitializer.StillPending(ds_.resolverProxyConfigurationId, ds_.version);
```

Exception for fresh deploy (`_initialize`): no guard needed — `_initialize` is called from the constructor when no prior version exists.

**Verification**: `npx hardhat compile --force` — zero new warnings.

---

### Phase 5 — `onlyOperational` Verification

**`contracts/services/core/InitializerModifiers.sol`**

`onlyOperational` calls `InitializerStorageWrapper.checkOperational(configId, version)`.
`checkOperational` reads `configVersionStatus[configId][version]` and reverts if `!= 1`.

With `_prepareReinitialization` writing `configVersionStatus[configId][to] = _REINIT_PENDING`,
the `onlyOperational` check on the `to` version will correctly revert until reinitialisation
completes. **No code change needed** — verify by tracing the read path.

Only modify this file if a test reveals unexpected behaviour.

---

### Phase 6 — Tests + Gas Benchmark

**`test/contracts/unit/layer_1/gasBenchmarkInitializer/gasBenchmarkInitializer.test.ts`**

Add three new `describe` blocks:

**Block A — `_prepareReinitialization` gas (from=0, fresh deploy)**

```
for N in [1, 5, 10, 25, 50, 100]:
  setup BLR diff (configId, 0, vN) → K = N
  call prepareReinitialization(bytes32(0), 0, configId, vN)
  measure and log gas
  assert configVersionStatus == Pending
  assert gas < HEDERA_PRACTICAL_LIMIT
```

**Block B — `_prepareReinitialization` K=0 immediate activation**

```
setup BLR diff (configId, v1, v2) with total == unchanged
call prepareReinitialization(configId, v1, configId, v2)
assert TokenOperational emitted
assert lastOperationalVersion == v2
assert gas < HEDERA_PRACTICAL_LIMIT
```

**Block C — `computeTransitionDiff` O(N) ceiling**

```
for N in [50, 100, 250, 500]:
  call computeTransitionDiff(bytes32(0), 0, configId, vN) with N facets in config
  assert gas < 7_500_000
  log result in summary table
```

**`contracts/test/mocks/GasBenchmarkInitializerHarness.sol`**

Extend with:

- `setupTransitionDiff(bytes32 fromConfigId, uint256 fromVersion, bytes32 toConfigId, uint256 toVersion, uint256 total, uint256 unchanged)`
  — stores the diff without BLR dependency (mirrors `IDiamondCutManager.getTransitionDiff`)
- `prepareReinitialization(bytes32 fromConfigId, uint256 fromVersion, bytes32 toConfigId, uint256 toVersion)`
  — calls internal `_prepareReinitialization` logic directly
- `getLastOperationalVersion()` — view helper for assertions

---

## Coding Conventions

| Convention                        | Source                                                                           |
| --------------------------------- | -------------------------------------------------------------------------------- |
| Storage via private pure accessor | `_diamondCutManagerStorage()`, `initializerStorage()`                            |
| Loop                              | `for (uint256 index; index < length; ) { ... unchecked { ++index; } }`           |
| Hash helpers                      | `keccak256(abi.encodePacked(...))` — never inline, always private function       |
| Implementations                   | `@inheritdoc IInterface` on every function, no duplicate prose                   |
| Errors                            | Defined in interface, not in implementation                                      |
| Revert pattern                    | `if (condition) revert CustomError(args)` — never `require` (library-compatible) |
| Named return variables            | `returns (uint256 count_)` — trailing underscore convention                      |
| Pragma                            | `pragma solidity >=0.8.0 <0.9.0;`                                                |
| SPDX                              | `// SPDX-License-Identifier: Apache-2.0`                                         |

---

## Verification Checklist

```
[ ] npx hardhat compile --force     — zero new warnings
[ ] npm run format                  — zero diff
[ ] npm run lint                    — zero new errors
[ ] npx hardhat test --no-compile   — all green
[ ] npx hardhat coverage            — no regression vs baseline
[ ] Gas benchmark N={1..100}        — table printed correctly
[ ] computeTransitionDiff N=500 < 7,500,000 gas
[ ] Fresh deploy                    — TokenOperational emitted after N initializes (from=bytes32(0))
[ ] Sequential upgrade              — TokenOperational emitted after K reinitializes
[ ] K=0 upgrade                     — TokenOperational emitted immediately from _prepareReinitialization
[ ] Re-init while Pending           — reverts AlreadyPendingReinitialization
[ ] Unregistered diff               — reverts TransitionDiffNotRegistered (4 params)
[ ] lastOperationalVersion          — updated correctly on every activation path
[ ] setConfigTargetCount removed    — confirm no remaining references in IInitializer or implementations
[ ] getLastOperationalVersion()     — new getter added to IInitializer + InitializerFacet (GA-10)
[ ] isOperational(configId,ver)     — new bool getter added to IInitializer + InitializerFacet (GA-10)
[ ] InitializerFacet selector count — update getStaticFunctionSelectors: -1 (setConfigTargetCount) +2 (new getters)
[ ] StillPending guard              — updateConfigVersion reverts if current version is Pending
[ ] Cross-config migration          — facet version downgrade works (composite key isolates contexts)
[ ] updateResolver                  — all N facets must reinitialize (fresh context keys)
```

---

## Fixtures & Scripts Impact

### `test/fixtures/infrastructure.fixture.ts`

`deployAtsInfrastructureFixture` calls `deploySystemWithNewBlr`, which deploys each token via the Factory. The Factory constructor triggers `_initialize` → `_prepareReinitialization(bytes32(0), 0, configId, v1)`. After this PR, any fixture that subsequently asserts the token is operational **before** all N facets have called `initialize` will fail.

**Required change**: After deploying infrastructure, the fixture must drive all facet `initialize` calls before asserting operational state. Today `deploySystemWithNewBlr` already calls `initialize` for all facets as part of deployment — verify that the full sequence completes before the fixture returns. If it does, no change is needed. If `deploySystemWithNewBlr` returns mid-sequence, extend the fixture to complete initialization.

### `test/fixtures/upgradeConfigurations.fixture.ts`

`deployUpgradeTestFixture` calls `deployAtsInfrastructureFixture` (see above) then deploys Equity and Bond tokens. The same fresh-deploy constraint applies to those two proxies.

Additionally, any test that calls `equityDiamondCut.updateConfigVersion(newVersion)` must now account for the Pending state: the token is **not** operational until all K changed facets call `reinitialize`. Tests that assert `isOperational == true` immediately after `updateConfigVersion` will fail.

**Required change**: After `updateConfigVersion`, drive all K `reinitialize` calls before asserting operational state, or assert `isOperational == false` during the Pending window.

### `scripts/workflows/upgradeConfigurations.ts` + `scripts/infrastructure/operations/updateResolverProxyConfig.ts`

`updateResolverProxyVersion` calls `updateConfigVersion()` on each proxy. After this PR that puts each proxy in Pending state. The workflow currently does **not** drive reinitialize calls — that is intentional (operators/facets call reinitialize independently). The workflow logs success after `updateConfigVersion` returns — this is still correct since the tx succeeds; the proxy is simply Pending.

**No functional change required** to these scripts. The comment in `updateResolverProxyConfig.ts` may be updated to document the new Pending state behavior, but that is optional cosmetic work outside this PR's scope.

### `test/scripts/integration/upgradeConfigurations.test.ts`

This integration test exercises the full `upgradeConfigurations` workflow. If it asserts tokens are operational after `updateConfigVersion` without first driving `reinitialize` calls, those assertions must be updated.

**Required change**: Audit assertions on operational state post-upgrade; update to drive reinitialize or assert Pending state as appropriate.
