# TODO: Library Architecture Migration

## 🎯 Goal: Complete StorageWrapper library migration per FINAL-PLAN-LIB-ARCH.md

**Status:** ✅ COMPLETED - 2/2 completed

---

## ✅ T1: AccessControlStorageWrapper Migration - COMPLETED

### S1.1: Convert to library | ✅ COMPLETED

- [x] Change `abstract contract` to `library`
- [x] Rename `_rolesStorage()` → `rolesStorage()`
- [x] Rename all `_functionName()` → `functionName()` (remove underscore prefix)
- [x] Make all functions `internal`

### S1.2: Verify AccessControl | ✅ COMPLETED

- [x] Check compilation - Solidity compiles successfully
- [x] Update all callers (~20 files) to use `AccessControlStorageWrapper.functionName()`

---

## ✅ T2: PauseStorageWrapper Migration - COMPLETED

### S2.1: Extract modifiers | ✅ COMPLETED

- [x] Create `PauseModifiers.sol` abstract contract with `onlyUnpaused` and `onlyPaused` modifiers
- [x] Convert PauseStorageWrapper to library with `isPaused()`, `setPause()`, etc.

### S2.2: Convert to library | ✅ COMPLETED

- [x] Change `abstract contract PauseStorageWrapper` to `library PauseStorageWrapper`
- [x] Rename all functions from `_pauseStorage()` → `pauseStorage()`, etc.
- [x] Update all callers (~18 files)
- [x] Update all imports from `PauseStorageWrapper` to `PauseModifiers` for modifier inheritance
- [x] Add `import { PauseStorageWrapper }` where library functions are called directly

### S2.3: Verify Pause | ✅ COMPLETED

- [x] Check compilation - Solidity compiles successfully

---

## ✅ T3: Final Verification - COMPLETED

- [x] Full compilation check - Solidity compiles successfully
- [x] Run unit tests (Tests run - failures are pre-existing TokenCoreOp library linking issues unrelated to this migration)
- [x] Update work-log.md (see session summary)

---

## Files Modified

### AccessControlStorageWrapper:

- ✅ `contracts/domain/core/AccessControlStorageWrapper.sol` - Library
- ✅ `contracts/infrastructure/utils/AccessControlModifiers.sol` - Uses library with `using` directive
- ✅ `contracts/infrastructure/utils/ProtectedPartitionRoleValidator.sol` - Direct library calls
- ✅ `contracts/infrastructure/proxy/ResolverProxyUnstructured.sol` - Direct library calls
- ✅ All facet files updated to use `AccessControlStorageWrapper.functionName()`

### PauseStorageWrapper:

- ✅ `contracts/domain/core/PauseStorageWrapper.sol` - Library
- ✅ `contracts/domain/core/PauseModifiers.sol` - NEW: abstract contract with modifiers
- ✅ All facet files updated to inherit from `PauseModifiers` and import `PauseStorageWrapper` where needed

---

## TypeScript Errors (Pre-existing)

The TypeScript errors are pre-existing library linking issues for `TokenCoreOps` - not related to this migration. These were present before the changes and need separate work to update the registry generator.

## Pattern Applied

```solidity
// Before (abstract contract inheritance)
abstract contract MyFacet is PauseStorageWrapper {
    function foo() external onlyUnpaused {
        if (_isPaused()) revert...;
    }
}

// After (modifiers from PauseModifiers, library calls)
import { PauseModifiers } from "../../../../domain/core/PauseModifiers.sol";
import { PauseStorageWrapper } from "../../../../domain/core/PauseStorageWrapper.sol";

abstract contract MyFacet is PauseModifiers {
    function foo() external onlyUnpaused {
        if (PauseStorageWrapper.isPaused()) revert...;
    }
}
```
