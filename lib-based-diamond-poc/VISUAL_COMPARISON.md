# Visual Code Comparison: OLD vs NEW Architecture

## The "Inheritance Monster" Problem

### OLD Architecture - OldInternals.sol (The Monster)

```solidity
abstract contract OldInternals is PauseInternal, AccessInternal, TokenInternal {
    // This contract inherits EVERYTHING from all three internals.
    //
    // In your real codebase, this would be even larger:
    // - CapInternal
    // - SupplyScheduleInternal
    // - SnapshotInternal
    // - ComplianceInternal
    // - DocumentInternal
    // - LockInternal
    // - CorporateActionsInternal
    // - ... and many more
    //
    // NOTE: The compiler does DEAD CODE ELIMINATION!
    // Only USED functions end up in bytecode.
    // But developers must navigate 1456+ lines of source code.
}
```

### OLD Architecture - Facet That Only Needs Pause

```solidity
// OldPauseFacet.sol
contract OldPauseFacet is OldInternals, IPauseFacet {
    // ⚠️ SOURCE CODE ISSUE: This facet inherits OldInternals
    //
    // What this facet ACTUALLY uses:
    // - _pause()
    // - _unpause()
    // - _paused()
    // - _checkRole()
    // - onlyRole modifier
    //
    // What exists in Internals.sol (1456 lines to navigate):
    // - _mint(), _burn(), _transfer(), _approve() ...
    // - _grantRole(), _revokeRole() ...
    // - hundreds of other functions
    //
    // NOTE: Compiler only includes USED code in bytecode!
    // The problem is NOT bytecode size - it's SOURCE CODE navigation.
    // Developer must search through 1456 lines to understand facet.

    function paused() external view override returns (bool) {
        return _paused();
    }

    function pause() external override onlyRole(PAUSER_ROLE) whenNotPaused {
        _pause();
    }

    function unpause() external override onlyRole(PAUSER_ROLE) whenPaused {
        _unpause();
    }
}
```

---

## The Clean Library Solution

### NEW Architecture - Focused Libraries

```solidity
// LibPause.sol - ONLY pause logic
library LibPause {
    error EnforcedPause();
    error ExpectedPause();
    event Paused(address account);
    event Unpaused(address account);

    function paused() internal view returns (bool) { ... }
    function pause() internal { ... }
    function unpause() internal { ... }
    function requireNotPaused() internal view { ... }
    function requirePaused() internal view { ... }
}

// LibAccess.sol - ONLY access control logic
library LibAccess {
    error AccessControlUnauthorizedAccount(address account, bytes32 role);
    event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender);
    event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender);

    function hasRole(bytes32 role, address account) internal view returns (bool) { ... }
    function checkRole(bytes32 role) internal view { ... }
    function grantRole(bytes32 role, address account) internal { ... }
    function revokeRole(bytes32 role, address account) internal { ... }
}

// LibToken.sol - ONLY token logic
library LibToken {
    // All ERC20 functionality here
    function name() internal view returns (string memory) { ... }
    function mint(address account, uint256 amount) internal { ... }
    function transfer(address from, address to, uint256 amount) internal { ... }
    // ... etc
}
```

### NEW Architecture - Clean Facet With Explicit Imports

```solidity
// NewPauseFacet.sol
import "../libraries/LibPause.sol";   // ✅ For pause logic
import "../libraries/LibAccess.sol";  // ✅ For role checking
// ✅ NO LibToken imported - this facet CANNOT touch tokens!

contract NewPauseFacet is IPauseFacet {
    // ✅ EXPLICIT: This facet can ONLY use pause and access control
    // ✅ CLEAR: Anyone reading the imports knows exactly what it does
    // ✅ SAFE: It's impossible to accidentally call token functions

    function paused() external view override returns (bool) {
        return LibPause.paused();
    }

    function pause() external override {
        LibAccess.checkRole(PAUSER_ROLE);
        LibPause.requireNotPaused();
        LibPause.pause();
    }

    function unpause() external override {
        LibAccess.checkRole(PAUSER_ROLE);
        LibPause.requirePaused();
        LibPause.unpause();
    }
}
```

---

## Side-by-Side: Understanding Dependencies

### Question: "What can this facet do?"

**OLD Architecture:**
```
OldMintableFacet
    └── inherits OldInternals
            └── inherits PauseInternal   (can pause/unpause everything?)
            └── inherits AccessInternal  (can grant/revoke any role?)
            └── inherits TokenInternal   (can transfer anyone's tokens?)
            └── inherits ... (what else is hidden?)

To answer: Must read ALL inherited contracts
```

**NEW Architecture:**
```
NewMintableFacet
    └── imports LibToken.sol    (✅ can mint/burn)
    └── imports LibAccess.sol   (✅ can check roles)
    └── imports LibPause.sol    (✅ respects pause)

To answer: Just read the imports!
```

---

## Side-by-Side: Making Changes

### Scenario: "Add a transfer hook for compliance"

**OLD Architecture:**
```
1. Modify TokenInternal._transfer()
2. This change affects:
   - OldTokenFacet (✅ intended)
   - OldMintableFacet (⚠️ might be affected)
   - OldPauseFacet (❓ does it inherit token?)
   - OldAccessFacet (❓ does it inherit token?)
   - ... need to check ALL facets

3. Risk: Accidentally breaking unrelated facets
```

**NEW Architecture:**
```
1. Modify LibToken.transfer()
2. This change affects:
   - NewTokenFacet (✅ imports LibToken)
   - NewMintableFacet (✅ imports LibToken)
3. Does NOT affect:
   - NewPauseFacet (doesn't import LibToken)
   - NewAccessFacet (doesn't import LibToken)

4. Risk: Zero - dependencies are explicit
```

---

## The Variant Explosion Problem

Your codebase has 4 variants per facet. Here's how SOURCE CODE complexity grows:

**OLD Architecture - 38 Base Facets × 4 Variants = 152 Facets**

Each variant inherits from the monster (source code dependency):
```
OldCouponFacetStandard         ─┬─► inherits OldInternals (1456 lines to navigate)
OldCouponFacetFixedRate        ─┤
OldCouponFacetKpiLinkedRate    ─┤
OldCouponFacetSPT              ─┘

OldRedemptionFacetStandard     ─┬─► inherits OldInternals (1456 lines to navigate)
OldRedemptionFacetFixedRate    ─┤
...                            ─┘
```

**Result:** To understand ANY facet, you must navigate the 1456-line monster.
(Note: Bytecode only contains USED code - compiler is smart!)

**NEW Architecture - 38 Base Facets × 4 Variants = 152 Facets**

Each variant imports ONLY what it needs:
```
NewCouponFacetStandard         ─┬─► imports LibCoupon, LibToken, LibPause
NewCouponFacetFixedRate        ─┤─► imports LibCoupon, LibToken, LibPause, LibRates
NewCouponFacetKpiLinkedRate    ─┤─► imports LibCoupon, LibToken, LibPause, LibKpi
NewCouponFacetSPT              ─┘─► imports LibCoupon, LibToken, LibPause, LibSPT

NewRedemptionFacetStandard     ─┬─► imports LibRedemption, LibToken
...                            ─┘
```

**Result:** Explicit imports = know exactly what each facet uses at a glance.

---

## Why Bytecode Size Is The Same (Both Ways!)

**Two compiler optimizations at play:**

### 1. Inheritance: Dead Code Elimination
```solidity
// Even though OldPauseFacet inherits 1456 functions from Internals...
contract OldPauseFacet is Internals {
    function pause() external { _pause(); }  // Only _pause() is used
}
// Compiler REMOVES all unused functions from bytecode!
```

### 2. Libraries: Function Inlining
```solidity
// Library internal functions get INLINED
library LibPause {
    function pause() internal { pauseStorage().paused = true; }
}

contract NewPauseFacet {
    function pause() external { LibPause.pause(); }
}
// After compilation, LibPause.pause() is inlined into the facet
```

**Result: BOTH produce the same bytecode!**

| | Inheritance | Libraries |
|--|------------|-----------|
| Bytecode size | Same | Same |
| Gas cost | Same | Same |
| Runtime | Same | Same |

**The difference is SOURCE CODE organization:**
- Inheritance: navigate 1456 lines, hidden dependencies
- Libraries: navigate 40-80 lines per lib, explicit imports

---

## Conclusion

| Aspect | OLD (Inheritance) | NEW (Libraries) |
|--------|-------------------|-----------------|
| **Bytecode** | Same (dead code eliminated) | Same (functions inlined) |
| **Gas** | Same | Same |
| **Runtime** | Same | Same |
| **Source navigation** | 🔴 1456 lines monster | 🟢 40-80 lines per lib |
| **Dependencies** | 🔴 Hidden in inheritance | 🟢 Explicit imports |
| **"What does facet do?"** | 🔴 Read inheritance chain | 🟢 Read 3-5 imports |
| **Change impact** | 🔴 Everything inherits Internals | 🟢 Grep for imports |

**Key insight:**
- The compiler is smart - bytecode is identical either way
- The benefit is 100% about SOURCE CODE organization
- Migration cost = development time only, zero performance loss
