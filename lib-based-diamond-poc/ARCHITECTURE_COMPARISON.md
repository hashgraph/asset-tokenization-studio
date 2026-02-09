# Diamond Facet Architecture: From Circular Inheritance Hell to Clean Libraries

## The Journey

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                                                                  │
│   ORIGINAL      PROBLEM         WORKAROUND #1      WORKAROUND #2     SOLUTION   │
│   ────────      ───────         ─────────────      ─────────────     ────────   │
│                                                                                  │
│   Small     →  Circular    →  Common layer:    →  Internals.sol: →  Libraries   │
│   focused      deps           serialize all       1,456 virtual     (no deps!)  │
│   contracts    everywhere     storage into        declarations                   │
│                               one chain           for bond variants              │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## Important: What The Compiler Does

**The Solidity compiler is smart!**

```solidity
// Even if you inherit 1456 functions...
contract MyFacet is Internals {
    function foo() external {
        _pause();  // Only this is used
    }
}

// The compiler ONLY includes _pause() in the bytecode!
// Dead code elimination removes the other 1455 functions.
```

**So bytecode size is NOT the issue.** Both inheritance and libraries produce similar bytecode because the compiler only includes what's actually called.

**The REAL issues are:**
1. **Circular dependencies** - Why the monster exists in the first place
2. **Source code organization** - Human readability, not machine output
3. **Explicit dependencies** - Knowing what a facet can do at a glance

---

## Phase 1: The Original Idea (Clean but Broken)

You wanted small, focused internal contracts:

```solidity
// ❌ ORIGINAL DESIGN - Clean but doesn't compile!

// pause/PauseInternal.sol
abstract contract PauseInternal {
    function _pause() internal { ... }
    function _unpause() internal { ... }
    function _requireNotPaused() internal view { ... }
}

// access/AccessInternal.sol
abstract contract AccessInternal {
    function _checkRole(bytes32 role) internal view { ... }
    function _grantRole(bytes32 role, address account) internal { ... }
}

// erc1410/ERC1410TransferInternal.sol
abstract contract ERC1410TransferInternal {
    function _transferByPartition(...) internal {
        _requireNotPaused();  // ❌ Where does this come from?
        _checkRole(ROLE);      // ❌ Where does this come from?
        // ... transfer logic
    }
}
```

**Problem**: `ERC1410TransferInternal` needs `_requireNotPaused()` and `_checkRole()`, but it doesn't inherit them!

---

## Phase 2: The Circular Dependency Problem

You try to fix it with inheritance:

```solidity
// ❌ ATTEMPTED FIX - Creates circular dependencies!

abstract contract ERC1410TransferInternal is PauseInternal, AccessInternal {
    function _transferByPartition(...) internal {
        _requireNotPaused();  // ✅ Now available from PauseInternal
        _checkRole(ROLE);      // ✅ Now available from AccessInternal
    }
}

// But wait... PauseInternal also needs role checking!
abstract contract PauseInternal is AccessInternal {  // 🔴 Inherits AccessInternal
    function _pause() internal {
        _checkRole(PAUSER_ROLE);  // Needs AccessInternal
        // ...
    }
}

// And AccessInternal needs... freeze checking? balance checking?
abstract contract AccessInternal is FreezeInternal {  // 🔴 Inherits FreezeInternal
    function _grantRole(...) internal {
        _requireNotFrozen(account);  // Needs FreezeInternal
    }
}

// And FreezeInternal needs...
abstract contract FreezeInternal is ERC1410TransferInternal {  // 🔴 CIRCULAR!
    // Needs balance info from ERC1410!
}
```

**Result**: Circular inheritance chain. **Won't compile.**

---

## Phase 3: The First Workaround (Common Layer)

The first approach to break circular dependencies was the **Common layer** — serialize all storage wrappers into one linear inheritance chain:

```solidity
// ⚠️ WORKAROUND #1 - Common layer: chain all storage into one path

// layer_0/common/Common.sol
abstract contract Common is SecurityStorageWrapper { /* 3 modifier overrides */ }

// SecurityStorageWrapper.sol → EquityStorageWrapper → BondStorageWrapper → ...
// One long chain — no circular deps because it's one linear path

// Every facet inherits Common → gets ALL storage operations
contract PauseFacet is PauseFacetBase, Common { /* ... */ }
```

**It works.** But the chain is arbitrary (why does Security inherit from Equity?) and adding new storage domains means inserting into the chain.

When **bond variants** arrived (FixedRate, KpiLinked, SustainabilityPerformanceTarget), empty bridge contracts appeared:

```solidity
// CommonFixedInterestRate.sol — literally empty!
abstract contract CommonFixedInterestRate is BondStorageWrapperFixedInterestRate {}
```

## Phase 3b: The Second Workaround (Internals Monster)

The Common chain handled storage, but bond variants needed virtual function dispatch across the variant hierarchy. So `Internals.sol` was added ON TOP of Common:

```solidity
// ⚠️ WORKAROUND #2 - Internals.sol: 1456 virtual declarations!

abstract contract Internals is Modifiers {

    // ALL functions in one place for variant-specific overrides
    function _pause() internal virtual;
    function _unpause() internal virtual;
    function _checkRole(bytes32 role) internal view virtual;
    function _grantRole(...) internal virtual;
    function _transferByPartition(...) internal virtual;
    function _setCoupon(...) internal virtual;
    // ... 1450 more functions ...
}

// Bond variant extensions override per-variant behavior
abstract contract InternalsFixedInterestRate is Internals {
    function _setCoupon(...) internal override { /* fixed-rate specific */ }
}
```

**Now we have TWO workaround layers stacked.** The Common chain serializes storage, and Internals serializes virtual dispatch. Developers navigate both to understand the code.

---

## Phase 4: The Source Code Problem

The issue isn't bytecode - it's **developer experience**:

```solidity
// When reading ERC1410TokenHolderFacet...

contract ERC1410TokenHolderFacet is Internals {
    function authorizeOperator(address _operator) external {
        _requireNotPaused();   // Where is this defined? 🤔
        _checkCompliance(...); // Where is this defined? 🤔
        _authorizeOperator(_operator); // Where is this defined? 🤔
    }
}

// To understand this facet, you must:
// 1. Open Internals.sol (1456 lines)
// 2. Search for each function
// 3. Understand the implementation
// 4. Hope you found the right one (no namespacing!)
```

**Questions that are hard to answer:**
- "What can this facet do?" → Read 1456 lines
- "Does this facet touch coupons?" → Search through Internals
- "If I change _pause(), what breaks?" → Everything inherits Internals

---

## Phase 5: The Solution (Libraries)

Libraries **don't inherit** - they **import and call**:

```solidity
// ✅ THE SOLUTION - Libraries!

// lib/LibPause.sol - ONLY pause logic (40 lines)
library LibPause {
    function requireNotPaused() internal view {
        if (pauseStorage().paused) revert EnforcedPause();
    }

    function pause() internal {
        LibAccess.checkRole(PAUSER_ROLE);  // ✅ Just import and call!
        pauseStorage().paused = true;
    }
}

// lib/LibAccess.sol - ONLY access logic (50 lines)
library LibAccess {
    function checkRole(bytes32 role) internal view {
        if (!hasRole(role, msg.sender)) revert Unauthorized();
    }

    function grantRole(bytes32 role, address account) internal {
        LibPause.requireNotPaused();  // ✅ Just import and call!
        accessStorage().roles[role][account] = true;
    }
}
```

**No inheritance = No circular dependencies!**

Libraries can call each other freely because they're just functions, not inheritance chains.

---

## Phase 6: The Clean Facet

Now the facet has **explicit imports**:

```solidity
// ✅ CLEAN FACET - Explicit dependencies!

import "./lib/LibPause.sol";
import "./lib/LibCompliance.sol";
import "./lib/LibERC1410Operator.sol";

contract ERC1410TokenHolderFacet is IERC1410TokenHolder {

    // LOOK AT THE IMPORTS ☝️
    // Instantly know: this facet uses Pause, Compliance, and Operator logic
    // Does NOT use: Coupon, Dividend, Snapshot, Voting, etc.

    function authorizeOperator(address _operator) external {
        LibPause.requireNotPaused();              // ✅ Clear: from LibPause
        LibCompliance.checkCompliance(...);       // ✅ Clear: from LibCompliance
        LibERC1410Operator.authorizeOperator(_operator); // ✅ Clear: from LibERC1410Operator
    }
}
```

**Questions now easy to answer:**
- "What can this facet do?" → Look at imports (3 lines)
- "Does this facet touch coupons?" → No LibCoupon import = No
- "If I change LibPause, what breaks?" → Grep for `import.*LibPause`

---

## The Real Comparison

### NOT About Bytecode

| Aspect | Inheritance | Libraries |
|--------|-------------|-----------|
| Bytecode size | Same (compiler optimizes) | Same (compiler inlines) |
| Gas cost | Same | Same |
| Runtime behavior | Same | Same |

### About Source Code Organization

| Aspect | Internals Monster | Libraries |
|--------|-------------------|-----------|
| **Circular deps** | Solved (by cramming everything together) | Solved (no inheritance) |
| **Lines to navigate** | 1456 in one file | 40-80 per focused file |
| **"What does facet use?"** | Read inheritance chain | Read imports |
| **Namespace** | None (`_pause` vs `_pause`) | Clear (`LibPause.pause`) |
| **Find implementations** | Ctrl+F in 1456 lines | Open the specific lib file |
| **Change impact analysis** | Everything inherits Internals | Grep for imports |

---

## Why Libraries Win

### 1. Solve Circular Dependencies Naturally

```solidity
// Libraries can call each other in ANY direction
LibA.foo() calls LibB.bar()
LibB.bar() calls LibA.baz()  // ✅ No problem!

// Inheritance cannot
contract A is B { }
contract B is A { }  // ❌ Circular!
```

### 2. Explicit Dependencies

```solidity
// OLD: What does this facet depend on?
contract MyFacet is Internals { }  // 🤷 Everything?

// NEW: What does this facet depend on?
import "./LibPause.sol";    // Pause logic
import "./LibAccess.sol";   // Access control
contract MyFacet { }        // ✅ Just those two!
```

### 3. Namespaced Functions

```solidity
// OLD: Which _pause() is this?
_pause();  // From Internals... somewhere

// NEW: Crystal clear
LibPause.pause();  // Obviously from LibPause
```

### 4. Easier Navigation

```
OLD: Find _transferByPartition implementation
→ Open Internals.sol (1456 lines)
→ Ctrl+F "_transferByPartition"
→ Hope there's only one

NEW: Find transferByPartition implementation
→ Open LibERC1410Transfer.sol (80 lines)
→ It's right there
```

---

## Compilation Results

```
╔══════════════════════════════════════════════════════════════════════════╗
║           ERC1410TokenHolder Facet - Bytecode Comparison                 ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  OLD (inherits Internals):     3376 bytes                                ║
║  NEW (library imports):        3362 bytes                                ║
║                                                                          ║
║  DIFFERENCE: -14 bytes (-0.41%)  ← Essentially identical!                ║
║                                                                          ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  This proves: Bytecode is NOT the differentiator.                        ║
║  The compiler optimizes both approaches equally well.                    ║
║                                                                          ║
║  The win is SOURCE CODE organization:                                    ║
║  - Circular deps solved                                                  ║
║  - Explicit imports                                                      ║
║  - Namespaced functions                                                  ║
║  - Easier navigation                                                     ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## Migration Strategy

```
Step 1: Create libraries (don't touch existing code)
────────────────────────────────────────────────────
lib/
├── LibPause.sol      ← Extract from Internals
├── LibAccess.sol     ← Extract from Internals
├── LibERC1410*.sol   ← Extract from Internals
└── ...

Step 2: Convert ONE facet at a time
────────────────────────────────────
- Pick ERC1410TokenHolderFacet
- Create NewERC1410TokenHolderFacet using libraries
- Deploy alongside old facet
- Test: same behavior?
- Replace in Diamond via diamondCut

Step 3: Repeat for all 152 facets
─────────────────────────────────
- One facet at a time
- Old and new can coexist
- Gradual migration, no big bang

Step 4: Delete Internals.sol 🎉
───────────────────────────────
- Once all facets migrated
- Remove the monster
- Celebrate!
```

---

## Summary

| Problem | Root Cause | Solution |
|---------|------------|----------|
| Common chain exists | Original circular inheritance workaround (serialized storage) | Libraries (no inheritance chain needed) |
| Internals monster exists | Added later for bond variant virtual dispatch | Libraries (no virtual/override ceremony) |
| Two workaround layers stacked | Each solved one problem but added complexity | Libraries solve both at once |
| Hard to navigate | 1456 lines in one file | Split into focused libraries |
| Hidden dependencies | Implicit inheritance | Explicit imports |
| Hard to find implementations | Search through monster | Open the specific library |

### The Bottom Line

**Bytecode**: Same (compiler is smart)

**Source code**:
- 1 monster file (1456 lines) → 14 focused libraries (~70 lines each)
- Hidden dependencies → Explicit imports
- `_pause()` → `LibPause.pause()`
- "What does this facet do?" 🤷 → "Look at the imports" ✅

**Libraries solve the circular dependency problem AND make code easier to read.**

---

## Library Layering: Not Spaghetti, But Architecture

A common concern: "If libraries can call each other freely — even circularly — won't that create spaghetti code?"

No. The libraries naturally organize into **clean tiers**:

```
LAYER 3 — FACETS            Thin wrappers: auth + pause + call libraries
LAYER 2 — ORCHESTRATORS     Coordinate domain libs (LibScheduledTasks, LibInterestRate)
LAYER 1 — DOMAIN LIBS       Own one domain (LibERC1410, LibABAF, LibSnapshots, LibBond)
LAYER 0 — LEAF LIBS         Zero lib dependencies (LibPause, LibAccess, LibCompliance)
```

**Why this is the opposite of spaghetti:**

In the current architecture, `_pause()` (leaf-level) sits next to `_executeScheduledTask()` (orchestrator-level) in the same 1,456-line Internals file, and storage access is serialized into a single Common chain where `SecurityStorageWrapper` inherits from `EquityStorageWrapper` for no domain reason. No structural hint of what orchestrates what. Everything is flat and arbitrary.

With libraries, the layers are visible in the import list. A leaf library importing an orchestrator would be an obvious code review red flag. And the compiler *enforces* the boundaries: if a facet doesn't import `LibERC1410`, it cannot call token functions. Period.

**Inheritance offers NO such enforcement.** Every facet inherits everything and can call any function. The only boundary is developer discipline.

See `contracts/complex-example/COMPLEX_EXAMPLE.md` for a full demonstration of this layering with 10 libraries handling the most complex workflow in the system (scheduled tasks + ABAF/LABAF + KPI-linked coupons).

---

## Why Not Fix Inheritance Instead of Using Libraries?

You could restructure inheritance into smaller abstract contracts for non-circular parts. But the circular dependency `ERC1410 ↔ ABAF ↔ Snapshots ↔ ERC1410` cannot be expressed in Solidity's inheritance system (C3 linearization rejects it). Your only options are:

| Approach | Result |
|----------|--------|
| Split into small abstract contracts | Circular inheritance — won't compile |
| Virtual functions in a shared base | This IS what Internals.sol already does |
| Interface-based decoupling | Doesn't work inside Diamond delegatecall context |
| Hook pattern (`_afterTransfer`) | Fails when dependency is bidirectional (ABAF reads balances, ERC1410 reads ABAF) |
| **Libraries** | **Circular calls compile. Root cause solved.** |

Libraries work because they're resolved at link-time, not inheritance-time. The compiler only needs function signatures, not a complete hierarchy.

See the ADR (FAQ Q7) for a detailed analysis of each workaround and why it fails.

---

## The Common Layer: A Retrospective

The Common layer was the **original** workaround for circular inheritance, and understanding why it worked — and where it broke — is key to understanding why libraries are the right next step.

### What Common Did

The insight was pragmatic: if you can't have a graph of storage wrappers (circular inheritance), **flatten the graph into a single chain**. One linear path can't be circular:

```
Common → SecurityStorageWrapper → EquityStorageWrapper → BondStorageWrapper → ...
```

Every facet does `is FacetBase, Common` and gets access to everything. It shipped. It worked.

### Where Common Broke Down

**1. It serializes a graph into a chain — an information-destroying operation.**

The real dependencies between domains are a graph. Security and Equity are unrelated. But the chain forces `SecurityStorageWrapper` to inherit from `EquityStorageWrapper`, coupling them for no domain reason. The real structure is lost.

**2. Empty bridge contracts are pure ceremony.**

```solidity
abstract contract CommonFixedInterestRate is BondStorageWrapperFixedInterestRate {}
```

Zero lines of code. Exists solely to satisfy the compiler's diamond inheritance resolution. When a system needs increasing ceremony to add features, the architecture is working against you.

**3. It hid the circular dependency instead of resolving it.**

ERC1410 and ABAF genuinely need each other. Common doesn't model that interaction — it just makes everything available through one path. The circular dependency is still *conceptually* there; it's just invisible. An auditor can't see the real dependency structure.

**4. Internals.sol had to be layered on top.**

When bond variants needed virtual dispatch, Common couldn't help (it's about storage, not behavior). So Internals.sol was added — a second workaround on the first. Two layers of compromise, each making the other harder to reason about. This is the ultimate proof Common alone wasn't enough.

### What Libraries Do Differently

```
Common layer:  dependency graph → serialized into chain → structure lost → ceremony added
Libraries:     dependency graph → expressed directly    → structure preserved → no ceremony
```

When `LibERC1410` imports `LibABAF` and `LibSnapshots`, and `LibSnapshots` imports `LibERC1410` back, you're looking at the *real* relationships. Nothing serialized, nothing hidden, nothing arbitrary. The circular dependency is expressed, compiled, and working — not swept under a rug.

Libraries eliminate **both** workaround layers (Common chain AND Internals monster) in one move.

See ADR FAQ Q9 for the full analysis.

---

## Unit Testing: Same or Different?

### Integration Tests: Exactly the Same

Both architectures are tested identically at the facet level:

```typescript
// test/ERC1410TokenHolder.test.ts - SAME for both architectures!

describe("ERC1410TokenHolderFacet", () => {
    let diamond: Diamond;
    let facet: IERC1410TokenHolder;

    beforeEach(async () => {
        // Deploy Diamond with facet (old OR new - same interface)
        diamond = await deployDiamond();
        facet = await ethers.getContractAt("IERC1410TokenHolder", diamond.address);
    });

    it("should authorize operator", async () => {
        await facet.authorizeOperator(operator.address);
        expect(await facet.isOperator(operator.address, owner.address)).to.be.true;
    });

    it("should revert when paused", async () => {
        await pauseFacet.pause();
        await expect(facet.authorizeOperator(operator.address))
            .to.be.revertedWith("EnforcedPause");
    });
});
```

**Key point**: Tests use the INTERFACE (`IERC1410TokenHolder`), not the implementation. Both architectures implement the same interface → same tests.

### Unit Testing Libraries: Slightly Easier

Libraries CAN be tested in isolation (without full Diamond deployment):

```solidity
// test/LibPause.t.sol (Foundry example)

import "forge-std/Test.sol";
import "../contracts/real/new/lib/LibPause.sol";

// Helper contract to expose library functions
contract LibPauseHarness {
    function pause() external {
        LibPause.pause();
    }

    function requireNotPaused() external view {
        LibPause.requireNotPaused();
    }

    function isPaused() external view returns (bool) {
        return LibPause.isPaused();
    }
}

contract LibPauseTest is Test {
    LibPauseHarness harness;

    function setUp() public {
        harness = new LibPauseHarness();
    }

    function test_pause() public {
        assertFalse(harness.isPaused());
        harness.pause();
        assertTrue(harness.isPaused());
    }

    function test_requireNotPaused_reverts() public {
        harness.pause();
        vm.expectRevert("EnforcedPause");
        harness.requireNotPaused();
    }
}
```

**With inheritance**, you'd need to deploy a contract that inherits `Internals` to test `_pause()`. This works, but:
- You inherit ALL 1456 functions to test ONE
- Test setup is heavier
- Harder to isolate what you're testing

### Comparison Table

| Aspect | Inheritance | Libraries |
|--------|-------------|-----------|
| **Integration tests** | Same (test interface) | Same (test interface) |
| **Test files** | Same structure | Same structure |
| **Mock setup** | Same | Same |
| **Isolated unit tests** | Harder (need full inheritance) | Easier (harness contract) |
| **Test a single function** | Deploy contract with Internals | Deploy small harness |
| **Test coverage** | Same | Same |

### Bottom Line for Testing

**Integration tests**: Exactly the same. Both test against `IERC1410TokenHolder`.

**Unit tests**: Libraries are slightly easier to test in isolation because:
1. You can create a small harness contract that only exposes the library functions you want to test
2. No need to inherit the 1456-line monster just to test `_pause()`
3. Clearer test isolation - you know exactly what code is being tested

**But honestly?** Most real testing happens at the integration level (full Diamond deployment), so the testing experience is 95% identical.
