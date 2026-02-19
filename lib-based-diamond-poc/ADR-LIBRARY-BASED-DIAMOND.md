# ADR-001: Migration from Inheritance-Based to Library-Based Diamond Architecture

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  ARCHITECTURE DECISION RECORD                                                 ║
║  Asset Tokenization Studio (ATS)                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Status:      PROPOSED                                                        ║
║  Date:        2026-02-06                                                      ║
║  Authors:     Miguel Gómez Carpena, Alberto Molina (technical review)         ║
║  Decision:    Migrate internal functions from inheritance to libraries        ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## TL;DR

| Question                  | Answer                                                                                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **What's the problem?**   | 1,456-line `Internals.sol` monster (created to support bond variant generation) on top of a Common layer chain (the original circular dependency workaround) |
| **What's the solution?**  | Replace with focused libraries (40-80 lines each)                                                                                                            |
| **Does bytecode change?** | No—within 0.5% (compiler optimizes both identically)                                                                                                         |
| **Does gas change?**      | No—zero difference                                                                                                                                           |
| **Lines of code saved?**  | ~1,456 (virtual declarations eliminated)                                                                                                                     |
| **Migration effort?**     | ~12 weeks, 152 facets                                                                                                                                        |
| **Can we rollback?**      | Yes—old/new facets coexist, instant `diamondCut` switch                                                                                                      |
| **Recommendation?**       | ✅ Approve with phased rollout                                                                                                                               |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Glossary](#2-glossary)
3. [The Problem: A Story](#3-the-problem-a-story)
4. [The Solution: Library-Based Architecture](#4-the-solution-library-based-architecture)
   - 4.3 [Library Layering Architecture](#43-library-layering-architecture) ← NEW
5. [Evidence: Concrete Data](#5-evidence-concrete-data)
6. [FAQ: Addressing All Concerns](#6-faq-addressing-all-concerns)
   - Q6: [Won't libraries create spaghetti code?](#q6-wont-libraries-create-spaghetti-code-less-domain-isolation) ← NEW
   - Q7: [Can't we achieve the same with inheritance?](#q7-cant-we-achieve-the-same-by-restructuring-inheritance-better) ← NEW
   - Q9: [Was the Common layer a good solution?](#q9-was-the-common-layer-a-good-solution-what-can-we-learn-from-it) ← NEW
   - Q10: [How would `_getTotalBalanceForAdjustedAt` work with libraries?](#q10-how-would-a-complex-cross-domain-function-like-_gettotalbalanceforadjustedat-work-with-libraries) ← NEW
7. [Risk Assessment](#7-risk-assessment)
8. [Migration Strategy](#8-migration-strategy)
9. [Rollback Procedures](#9-rollback-procedures)
10. [Decision](#10-decision)
11. [Appendix](#11-appendix)
    - 11.4 [Technical Review Summary (Alberto)](#114-technical-review-summary-alberto-molina) ← NEW

---

## 1. Executive Summary

### 1.1 Current State

The Asset Tokenization Studio uses the Diamond pattern (EIP-2535) with 152 facet contracts. The architecture evolved through two workaround layers:

1. **The Common layer** (original workaround): To avoid circular inheritance, all storage wrappers were chained into a single linear inheritance path (`Common → SecurityStorageWrapper → EquityStorageWrapper → BondStorageWrapper → ...`). Every facet does `is FacetBase, Common`, giving it access to all storage operations through one chain. Variant bridges (`CommonFixedInterestRate`, `CommonKpiLinkedInterestRate`, etc.) — often empty abstract contracts — exist solely to resolve Solidity's diamond inheritance for bond-specific storage.

2. **Internals.sol** (later addition): When bond variant generation was needed (FixedRate, KpiLinked, SustainabilityPerformanceTarget), the Common chain alone couldn't handle the virtual function resolution needed across variants. `Internals.sol` was created as a 1,456-line abstract contract declaring all internal virtual functions, allowing variant-specific overrides in `InternalsFixedInterestRate`, `InternalsKpiLinkedInterestRate`, etc.

Neither layer was an intentional architectural design — both are workarounds for Solidity's structural limitations.

### 1.2 Problems with Current State

| Problem                            | Impact                                   |
| ---------------------------------- | ---------------------------------------- |
| 1,456 lines in one file            | Hard to navigate, find implementations   |
| Every facet inherits everything    | Can't tell what a facet actually uses    |
| Virtual + override required        | 2,912 duplicate function signatures      |
| Hidden dependencies                | Audit difficulty, bug traceability       |
| Two layers of workarounds          | Common chain + Internals monster stacked |
| Circular deps "solved" not "fixed" | Root cause still exists                  |

### 1.3 Proposed Solution

Migrate to **library-based architecture** where:

- Focused libraries (40-80 lines) replace monolithic Internals
- Facets import only the libraries they need
- Explicit dependencies visible in import statements
- No virtual/override ceremony required

### 1.4 What Changes vs What Stays the Same

| Changes                                   | Stays the Same      |
| ----------------------------------------- | ------------------- |
| Code organization (inheritance → imports) | Bytecode size       |
| Function syntax (`_foo()` → `LibX.foo()`) | Gas costs           |
| Dependency visibility (hidden → explicit) | Storage layout      |
| Boilerplate (~1,456 lines removed)        | External interfaces |
|                                           | Runtime behavior    |
|                                           | Diamond proxy logic |

---

## 2. Glossary

| Term                 | Definition                                                                                     |
| -------------------- | ---------------------------------------------------------------------------------------------- |
| **Diamond Pattern**  | EIP-2535 standard allowing unlimited contract size via modular facets sharing storage          |
| **Facet**            | A contract containing a subset of Diamond functionality, deployed once and referenced by proxy |
| **Diamond Storage**  | Pattern accessing storage via deterministic slots (`keccak256`) instead of state variables     |
| **Internals.sol**    | Current 1,456-line abstract contract declaring all internal virtual functions                  |
| **Virtual**          | Solidity keyword marking a function as overridable by child contracts                          |
| **Override**         | Solidity keyword indicating a function overrides a parent's virtual function                   |
| **Internal Library** | Library with `internal` functions that get inlined (copied) into calling code at compile time  |

---

## 3. The Problem: A Story

### 3.1 Chapter 1: The Vision

When ATS began, the architecture vision was elegant: small, focused contracts, each doing one thing well.

```solidity
// The dream: Clean, single-responsibility contracts
abstract contract PauseInternal {
  function _pause() internal {
    /* only pause logic */
  }
}

abstract contract AccessInternal {
  function _checkRole() internal {
    /* only access logic */
  }
}
```

### 3.2 Chapter 2: The Reality

Then came the requirements. `_transferByPartition()` needed pause checks. `_pause()` needed role checks. `_grantRole()` needed freeze checks. And `_freeze()` needed balance info...

```
ERC1410TransferInternal
    └── needs PauseInternal
            └── needs AccessInternal
                    └── needs FreezeInternal
                            └── needs ERC1410TransferInternal  ← CIRCULAR!
```

**The compiler said no.** Circular inheritance is structurally impossible in Solidity.

### 3.3 Chapter 3: The First Workaround — The Common Layer

The first solution was clever: **serialize all storage wrappers into one long inheritance chain**, then have every facet inherit from `Common`:

```solidity
// The Common chain: all storage wrappers in one linear path
abstract contract Common is SecurityStorageWrapper {
  /* 3 modifier overrides */
}
abstract contract SecurityStorageWrapper is EquityStorageWrapper {
  /* security storage */
}
abstract contract EquityStorageWrapper is BondStorageWrapper {
  /* equity storage */
}
abstract contract BondStorageWrapper is ERC20PermitStorageWrapper {
  /* bond storage */
}
// ... chain continues through all storage domains ...

// Every facet inherits Common → gets access to ALL storage operations
contract PauseFacet is PauseFacetBase, Common {
  /* ... */
}
```

**It works.** By serializing all storage into one chain, circular deps disappear — there's only one linear path. But it had its own problems:

1. **Arbitrary ordering:** Why does `SecurityStorageWrapper` inherit from `EquityStorageWrapper`? No domain reason — just chain position.
2. **Tight coupling:** Adding a new storage domain means inserting into the chain, potentially affecting all downstream contracts.
3. **Empty bridge contracts:** When bond variants arrived, variant-specific Common bridges were needed:

```solidity
// CommonFixedInterestRate.sol — literally an empty contract
abstract contract CommonFixedInterestRate is BondStorageWrapperFixedInterestRate {}

// CommonKpiLinkedInterestRate.sol — also empty
abstract contract CommonKpiLinkedInterestRate is BondStorageWrapperKpiLinkedInterestRate {}
```

These empty contracts exist solely to appease the compiler's diamond inheritance resolution.

### 3.4 Chapter 4: The Second Workaround — The Internals Monster

The Common chain handled storage access, but when **bond variant generation** was needed (FixedRate, KpiLinked, SustainabilityPerformanceTarget), a new problem emerged: the same business logic needed to behave differently per variant. Virtual function overrides were needed across the variant hierarchy.

The solution: put ALL virtual function declarations in ONE contract:

```solidity
// Internals.sol — 1,456 virtual declarations
abstract contract Internals is Modifiers {
  function _pause() internal virtual;
  function _checkRole() internal virtual;
  function _transfer() internal virtual;
  function _setCoupon() internal virtual;
  // ... 1,452 more ...
}

// Variant-specific overrides
abstract contract InternalsFixedInterestRate is ModifiersFixedInterestRate, Internals {
  function _setCoupon() internal override {
    /* fixed-rate specific */
  }
}
```

Now the system carries **two layers of workarounds**: the Common chain (for storage serialization) AND the Internals monster (for variant-specific virtual dispatch). Both still exist today.

### 3.5 Chapter 5: Today

We live with:

- **The Common chain:** `Common → SecurityStorageWrapper → Equity → Bond → ...` serializing all storage
- **3 variant Common bridges:** Empty contracts for diamond inheritance resolution
- **1 monster file:** `layer_0/Internals.sol` (1,456 virtual declarations)
- **4 extension monsters:** Additional Internals files for bond variants (`InternalsFixedInterestRate`, etc.)
- **156+ override implementations:** Scattered across storage wrappers
- **152 facets:** All inheriting through both layers
- **Two workarounds stacked:** Neither is a solution

---

## 4. The Solution: Library-Based Architecture

### 4.1 The Key Insight

Libraries don't create structural dependencies. When you write `import "./LibB.sol"`, the compiler only needs to know LibB's function signatures exist—not its full structure.

```solidity
// This COMPILES because imports only need signatures
import "./LibB.sol";
library LibA {
  function doA() internal {
    LibB.doB();
  }
}

import "./LibA.sol";
library LibB {
  function doB() internal {
    LibA.doA();
  } // Circular? No problem!
}
```

### 4.2 Visual Comparison

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                              BEFORE (Inheritance)                              ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║    ┌─────────────────────────────────────────────────────────────────────┐    ║
║    │                     INTERNALS.SOL (1,456 lines)                      │    ║
║    │  function _pause() internal virtual;                                 │    ║
║    │  function _unpause() internal virtual;                               │    ║
║    │  function _checkRole(...) internal virtual;                          │    ║
║    │  ... 1,453 more virtual declarations ...                             │    ║
║    └─────────────────────────────────────────────────────────────────────┘    ║
║                                    ▲                                          ║
║                                    │ is (inherits ALL 1,456)                  ║
║              ┌─────────────────────┼─────────────────────┐                    ║
║              │                     │                     │                    ║
║       ┌──────┴──────┐       ┌──────┴──────┐       ┌──────┴──────┐            ║
║       │ PauseFacet  │       │ TokenFacet  │       │ 150 others  │            ║
║       │ uses: 3 fn  │       │ uses: 10 fn │       │ uses: varies│            ║
║       │ gets: 1,456 │       │ gets: 1,456 │       │ gets: 1,456 │            ║
║       └─────────────┘       └─────────────┘       └─────────────┘            ║
║                                                                               ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║  ❌ Every facet inherits everything                                           ║
║  ❌ Can't tell what facet actually uses                                       ║
║  ❌ 1,456 virtual + 1,456 override = massive duplication                      ║
╚═══════════════════════════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════════════════════════╗
║                              AFTER (Libraries)                                 ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║    ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐            ║
║    │ LibPause   │  │ LibAccess  │  │ LibToken   │  │ LibCoupon  │  ... 16    ║
║    │ (40 lines) │  │ (60 lines) │  │ (80 lines) │  │ (70 lines) │  more     ║
║    └────────────┘  └────────────┘  └────────────┘  └────────────┘            ║
║          │               │               │               │                    ║
║          │ import        │ import        │ import        │ import             ║
║          ▼               ▼               ▼               ▼                    ║
║    ┌─────────────────────────────────────────────────────────────────────┐    ║
║    │                              FACETS                                  │    ║
║    │                                                                      │    ║
║    │  PauseFacet           TokenFacet           CouponFacet              │    ║
║    │  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐         │    ║
║    │  │import LibPause│    │import LibPause│    │import LibPause│         │    ║
║    │  │import LibAccess│   │import LibAccess│   │import LibAccess│        │    ║
║    │  │              │     │import LibToken│    │import LibToken│         │    ║
║    │  │              │     │              │     │import LibCoupon│        │    ║
║    │  └──────────────┘     └──────────────┘     └──────────────┘         │    ║
║    │                                                                      │    ║
║    └─────────────────────────────────────────────────────────────────────┘    ║
║                                                                               ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║  ✅ Each facet imports ONLY what it uses                                      ║
║  ✅ Dependencies visible in 3-5 import lines                                  ║
║  ✅ No virtual/override ceremony                                              ║
║  ✅ ~1,456 lines of boilerplate eliminated                                    ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

### 4.3 Library Layering Architecture

One of the strongest properties of the library-based approach is that it naturally organizes into **clean architectural layers**. Each layer has a clear role, and dependencies flow upward:

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                        LIBRARY LAYERING ARCHITECTURE                          ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  LAYER 3 — FACETS (orchestration)                                             ║
║  ─────────────────────────────────                                            ║
║  Thin contracts that compose libraries to expose external functionality.      ║
║  No business logic of their own — only wire libraries together.               ║
║                                                                               ║
║    CouponPaymentFacet    ScheduledTasksFacet    AdjustBalancesFacet           ║
║    (8 lib imports)       (3 lib imports)         (6 lib imports)              ║
║           │                      │                      │                     ║
║           ▼                      ▼                      ▼                     ║
║  LAYER 2 — ORCHESTRATOR LIBRARIES (coordination)                              ║
║  ────────────────────────────────────────────────                              ║
║  Libraries that coordinate multiple domain libraries. They know HOW           ║
║  operations combine but not the detail of each operation.                     ║
║                                                                               ║
║    LibScheduledTasks ──────────────────────────────────────                    ║
║    │  "Execute tasks in order: adjustments, then snapshots, then coupons"     ║
║    │  calls: LibABAF, LibSnapshots, LibBond, LibCorporateActions              ║
║    │                                                                          ║
║    LibInterestRate ────────────────────────────────────────                    ║
║    │  "Calculate KPI-linked rate from reports and previous coupons"           ║
║    │  calls: LibBond                                                          ║
║           │                      │                                            ║
║           ▼                      ▼                                            ║
║  LAYER 1 — DOMAIN LIBRARIES (core business logic)                             ║
║  ─────────────────────────────────────────────────                             ║
║  Libraries that own ONE domain's logic and data. May call other domain        ║
║  libraries when domains naturally interact (e.g., transfers need ABAF sync).  ║
║  Circular calls between domain libraries are safe with library architecture.  ║
║                                                                               ║
║    LibERC1410 ◄───────► LibSnapshots                                          ║
║    (token engine)        (point-in-time)                                      ║
║       │    │                 │                                                 ║
║       │    └─────────────────┘                                                ║
║       ▼                                                                       ║
║    LibABAF               LibBond                                              ║
║    (adjustment math)     (coupon data)                                        ║
║           │                                                                   ║
║           ▼                                                                   ║
║  LAYER 0 — LEAF LIBRARIES (zero library dependencies)                         ║
║  ─────────────────────────────────────────────────────                         ║
║  Pure utility libraries with no dependencies on other libraries.              ║
║  Only access their own storage. Safest, simplest building blocks.             ║
║                                                                               ║
║    LibPause       LibAccess       LibCompliance       LibCorporateActions     ║
║    (37 LOC)       (42 LOC)        (22 LOC)            (28 LOC)               ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

**Why layering matters:**

The layers create a mental model for developers. When you see a facet importing `LibScheduledTasks`, you know it's using an orchestrator — and if you need the detail, you open that library and see _its_ imports in turn. This is **progressive disclosure**: understand the system at the level of abstraction you need, without being forced to absorb all 1,456 lines at once.

With the old Internals monster, there are no layers. Everything is flat. `_pause()` sits next to `_calculateKpiLinkedRate()` sits next to `_transferByPartition()`. A developer's only navigation tool is Ctrl+F.

**Layer discipline:**

| Layer                  | Rule                                                  | Enforced by            |
| ---------------------- | ----------------------------------------------------- | ---------------------- |
| Layer 0 (Leaf)         | No `import "./Lib*.sol"` — only storage accessors     | Code review, grep      |
| Layer 1 (Domain)       | May import other domain libs for natural interactions | Import list visibility |
| Layer 2 (Orchestrator) | Coordinates domain libs, no direct storage writes     | Convention             |
| Layer 3 (Facet)        | Wires libraries together, no business logic           | Code review            |

**Anti-pattern to watch for:** If someone creates a library that imports 8+ other libraries, it's becoming a new Internals monster. The import list is the canary — keep it short.

### 4.4 Code Comparison

**Same functionality, different organization:**

```solidity
// ═══════════════════════════════════════════════════════════════════════════
// BEFORE: Inheritance
// ═══════════════════════════════════════════════════════════════════════════

// File 1: Internals.sol (declaration only)
abstract contract Internals {
  function _setPause(bool _paused) internal virtual; // Just signature
}

// File 2: PauseStorageWrapper.sol (implementation)
abstract contract PauseStorageWrapper {
  function _setPause(bool _paused) internal override {
    // DUPLICATE signature
    _pauseStorage().paused = _paused;
    emit TokenPaused(msg.sender);
  }
}

// File 3: PauseFacet.sol
contract PauseFacet is
  Internals // Inherits ALL 1,456 functions
{
  function pause() external {
    _checkRole(PAUSER_ROLE);
    _setPause(true);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// AFTER: Libraries
// ═══════════════════════════════════════════════════════════════════════════

// File 1: LibPause.sol (implementation only - no separate declaration!)
library LibPause {
  function setPause(bool _paused) internal {
    // NO virtual, NO override
    pauseStorage().paused = _paused;
    emit TokenPaused(msg.sender);
  }
}

// File 2: PauseFacet.sol
import "./lib/LibPause.sol"; // Only imports what it needs
import "./lib/LibAccess.sol";

contract PauseFacet {
  // NO inheritance
  function pause() external {
    LibAccess.checkRole(PAUSER_ROLE);
    LibPause.setPause(true);
  }
}
```

---

## 5. Evidence: Concrete Data

### 5.1 Line Count Analysis

| Metric                                  | Inheritance | Libraries | Change           |
| --------------------------------------- | ----------- | --------- | ---------------- |
| Virtual declarations in Internals.sol   | 1,456       | 0         | **-1,456**       |
| `override` keywords in storage wrappers | 156+        | 0         | **-156**         |
| Function signature duplications         | ~1,456      | 0         | **Eliminated**   |
| Import lines (152 facets × 4 avg)       | 152         | ~608      | +456             |
| **Net line change**                     | —           | —         | **~1,000 fewer** |

### 5.2 Bytecode Comparison

```
┌─────────────────────────────────────────────────────────────────────────────┐
│              ERC1410TokenHolderFacet - Compiled Bytecode                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│    Inheritance version:    3,376 bytes                                      │
│    Library version:        3,362 bytes                                      │
│    ────────────────────────────────────                                     │
│    Difference:             -14 bytes (-0.41%)                               │
│                                                                             │
│    CONCLUSION: Effectively identical                                        │
│                                                                             │
│    Why? Both approaches optimize to same output:                            │
│    • Inheritance: Dead code elimination removes unused functions            │
│    • Libraries: Internal functions inlined into calling code                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Gas Comparison

| Operation                              | Inheritance | Libraries  | Difference          |
| -------------------------------------- | ----------- | ---------- | ------------------- |
| Internal function call                 | Inlined     | Inlined    | 0                   |
| Storage read (`pauseStorage().paused`) | Same slot   | Same slot  | 0                   |
| Storage write                          | Same slot   | Same slot  | 0                   |
| Event emission                         | Same event  | Same event | 0                   |
| **Total**                              | —           | —          | **Zero difference** |

### 5.4 Storage Access Verification

Both architectures use identical storage access:

```solidity
// BEFORE (Internals.sol)
function _authorizeOperator(address _operator) internal override {
  erc1410Storage().operators[msg.sender][_operator] = true;
}

// AFTER (LibERC1410Operator.sol)
function authorizeOperator(address operator) internal {
  erc1410Storage().operators[msg.sender][operator] = true; // IDENTICAL
}
```

**Same storage file, same slot, same mapping structure.**

---

## 6. FAQ: Addressing All Concerns

### Q1: "Libraries can't have storage variables"

**A:** Correct, but irrelevant. We use Diamond Storage pattern where storage is accessed via slot pointers, not state variables. This is **exactly what Internals.sol already does**:

```solidity
// Storage defined at FILE level (not in library)
function pauseStorage() pure returns (PauseStorage storage s) {
  assembly {
    s.slot := keccak256("diamond.storage.pause")
  }
}

// Library uses the accessor
library LibPause {
  function pause() internal {
    pauseStorage().paused = true; // Works perfectly
  }
}
```

---

### Q2: "Won't circular imports fail?"

**A:** No. Tested and compiled successfully.

**Why:** `import` only tells compiler "this function signature exists." Unlike inheritance, it doesn't require the full structure to be defined first.

**Proof:** `lib-based-diamond-poc/contracts/circular-test/TestCircular.sol`

---

### Q3: "Won't circular function calls cause infinite loops?"

**A:** Only if there's no base case—same as any recursion. This is **mutual recursion**, a valid programming pattern.

```solidity
// LibA.processA(x) calls LibB.processB(x-1)
// LibB.processB(x) calls LibA.processA(x-1)
// Base case: if (x == 0) return;

// processA(3) → processB(2) → processA(1) → processB(0) → returns
```

**Proof:** `lib-based-diamond-poc/contracts/circular-test/TestCircularFunctions.sol`

---

### Q4: "Search works fine in Internals.sol"

**A:** True for "where is X defined?" But libraries answer different questions faster:

| Question                             | Inheritance            | Libraries                 |
| ------------------------------------ | ---------------------- | ------------------------- |
| Where is `_pause()`?                 | Ctrl+F (5 sec)         | Open LibPause.sol         |
| What can TokenFacet do?              | Read all code          | Read 4 imports            |
| If I change `_pause()`, what breaks? | Everything inherits it | `grep "import.*LibPause"` |

---

### Q5: "More imports means more code"

**A:** 3-5 more import lines per facet, but 1,456 fewer virtual declarations. **Net: ~1,000 lines saved.**

---

### Q6: "Won't libraries create spaghetti code? Less domain isolation?"

**A:** No — libraries do the opposite. Here's why.

The confusion comes from seeing that libraries _can_ call each other freely, including circularly. That sounds like it could lead to a tangled mess. But the critical insight is: **the current Internals.sol is already the ultimate spaghetti** — it's just _hidden_ spaghetti. Every facet can call any of 1,456 functions. The dependency graph is a fully-connected mesh, invisible from the source code. You only discover it by reading every line.

With libraries, the spaghetti **becomes visible**. And visible spaghetti is spaghetti you can fix.

Consider what actually enforces domain isolation in each approach:

**Old (inheritance):** Nothing structural. `OldCouponPaymentFacet` inherits `OldInternals`, which means a developer _could_ call `_grantRole()` or `_pause()` or `_issueByPartition()` from inside the coupon payment logic. The compiler won't stop them. Code review might catch it — might not. There's no structural boundary, only convention and discipline.

**New (libraries):** The import list is the boundary. If `NewCouponPaymentFacet` doesn't import `LibERC1410`, it literally _cannot_ call `LibERC1410.issueByPartition()`. The compiler enforces it. Want to know if a facet can mint tokens? Check the imports. If `LibERC1410` isn't there, the answer is no. Instantly, structurally, enforced.

The library layering described in Section 4.3 further strengthens this: leaf libraries (Pause, Access, Compliance, CorporateActions) → domain libraries (ABAF, ERC1410, Snapshots, Bond) → orchestrator libraries (ScheduledTasks, InterestRate) → facets. Each layer has clear rules about what it can import. A leaf library importing an orchestrator would be an obvious red flag in code review.

**One thing to watch for:** library sprawl. If someone creates a `LibEverything` that imports all 10 libraries, you're back to the monster. But that's a code review concern, not an architectural one. The _structure_ guides you toward small, focused libraries. The _inheritance_ structure guides you toward one giant abstract contract.

|                                            | Inheritance (Old)                      | Libraries (New)                              |
| ------------------------------------------ | -------------------------------------- | -------------------------------------------- |
| **Can facet call unrelated domain logic?** | Yes — inherits everything              | No — compiler rejects missing imports        |
| **How to check what a facet can do?**      | Read all inherited code                | Read the import list                         |
| **Is domain isolation enforced?**          | By convention only                     | By compiler (missing import = compile error) |
| **Blast radius of a change**               | All 152 facets (all inherit Internals) | Only files that import the changed library   |

---

### Q7: "Can't we achieve the same by restructuring inheritance better?"

**A:** Partially, but with a fundamental wall that libraries solve.

You _could_ restructure the inheritance to use small, focused abstract contracts instead of one monster:

```solidity
abstract contract PauseInternal {
    function _pause() internal virtual { ... }
}
abstract contract AccessInternal {
    function _checkRole(bytes32) internal virtual { ... }
}
abstract contract ABAFInternal is AccessInternal {
    function _updateAbaf(uint256) internal virtual { ... }
}
```

This works fine... until you hit the circular dependency:

```solidity
abstract contract ERC1410Internal is ABAFInternal, SnapshotsInternal {
  // needs ABAF for adjusted balances, Snapshots for transfer updates
}
abstract contract SnapshotsInternal is ERC1410Internal {
  // needs ERC1410 for holder list and balances
  // ❌ CIRCULAR: ERC1410Internal → SnapshotsInternal → ERC1410Internal
}
```

This **will not compile**. Solidity's C3 linearization algorithm rejects circular inheritance chains. Period. This is the exact reason the Common layer was created in the first place — serializing all storage wrappers into one linear chain was the original way to break the cycle. When bond variants later demanded virtual dispatch across variants, the Internals monster was added on top as a second workaround layer. Both are consequences of inheritance's inability to express circular dependencies.

**The workarounds all have problems:**

| Workaround                              | What it does                                                                    | Why it fails                                                                                                                                                                                                               |
| --------------------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Virtual functions with late binding** | Put circular functions as `virtual` in a shared base, override later            | This IS what Internals.sol already does — you'd rebuild the monster with extra steps                                                                                                                                       |
| **Interface-based decoupling**          | Have `ERC1410Internal` call through an `ISnapshotUpdater` interface             | Inside a Diamond proxy, all facets share storage via `delegatecall` — you can't do interface-based dispatch between internals without external calls, which means cross-facet calls with broken `msg.sender` context       |
| **Hook pattern**                        | `ERC1410Internal` defines `_afterTransfer()` that `SnapshotsInternal` overrides | Works for one-way notifications but fails when the dependency is bidirectional (ABAF needs to _read_ raw balances, ERC1410 needs to _read_ current ABAF — that's not a hook, it's a genuine bidirectional data dependency) |

Libraries solve this because they aren't in the inheritance graph at all. They're compiled as inline code. When the compiler sees `LibABAF.syncBalanceAdjustments()`, it doesn't need `LibABAF` to be "above" or "below" `LibERC1410` in any hierarchy. It just needs the function signature to exist. The function body gets inlined into the calling contract's bytecode. Circular _calls_ work because the resolution happens at link-time, not at inheritance-time.

**Bottom line:** You could get _partway_ there with better-structured inheritance (smaller abstract contracts, clearer hierarchy), but you'd still hit a wall at every circular dependency point. And in this system — with ABAF ↔ ERC1410 ↔ Snapshots ↔ ERC1410 — that wall appears in the most critical, most complex part of the codebase. Libraries are the only approach that resolves this structurally rather than by collapsing everything into one file.

---

### Q8: "The Common chain + Internals monster will be fixed properly later"

**A:** How? As Q7 demonstrates, the options are limited:

| Option                       | Result                                                                 |
| ---------------------------- | ---------------------------------------------------------------------- |
| Split into smaller internals | Circular inheritance returns                                           |
| Improve the Common chain     | Still couples unrelated domains, still needs empty bridge contracts    |
| Keep one big organized file  | Still 1,456 lines, still hidden deps                                   |
| Migrate to libraries         | Root cause solved — both Common chain AND Internals monster eliminated |

---

### Q9: "Was the Common layer a good solution? What can we learn from it?"

**A:** The Common layer was a genuinely clever hack — and understanding _why_ it worked (and where it broke down) clarifies why libraries are the right next step.

**What the Common layer got right:**

The core insight was pragmatic and smart: if you can't have a _graph_ of storage wrappers (because graphs can be circular and Solidity rejects circular inheritance), **flatten the graph into a single chain**. One linear path means zero circular deps, because linearity can't be circular. The team shipped. The system worked. That matters.

**What the Common layer got wrong — serializing a graph into a chain:**

The real dependency relationships between domains are a graph: Security needs Access, Equity needs ERC1410, Bond needs ERC1410 AND its own coupon storage. The Common chain forces this into one linear order:

```
Common → SecurityStorageWrapper → EquityStorageWrapper → BondStorageWrapper → ...
```

That ordering is _arbitrary_. There's no domain reason why `SecurityStorageWrapper` should inherit from `EquityStorageWrapper`. They're unrelated domains. But the chain forces the coupling — changing one can cascade to the other. This is an **information-destroying operation**: the real structure (a graph with independent nodes) is lost when serialized into a chain.

**The empty bridge contracts are the tell:**

When you see:

```solidity
abstract contract CommonFixedInterestRate is BondStorageWrapperFixedInterestRate {}
```

...a contract with _literally zero code_ in its body — you're looking at a contract that exists purely to satisfy the compiler. It does nothing for the developer reading the code, nothing for domain understanding, nothing for auditing. It's ceremony. When a system needs increasing amounts of ceremony to add new features, the architecture is working _against_ you rather than _for_ you.

**Common solved the symptom, not the disease:**

The circular dependency still _conceptually_ exists — ERC1410 and ABAF genuinely need each other, and no amount of chain serialization changes that fact. Common hides this by making everything available through one path. The dependency is still there; it's just invisible in source code. This is arguably worse than having it be explicit, because an auditor can't see the real dependency structure.

**The proof: Internals.sol had to be layered on top:**

When bond variants arrived and the system needed virtual function dispatch across variants, Common couldn't help — it handles storage access, not behavior customization. So `Internals.sol` was added as a _second_ workaround on top of the _first_ workaround. Two layers of architectural compromise stacked together, each making the other harder to reason about.

**What libraries give you that Common never could:**

Libraries model the **actual dependency graph**. When `LibERC1410` imports `LibABAF` and `LibSnapshots`, and `LibSnapshots` imports `LibERC1410` back, you're looking at the _real_ relationships between these domains. Nothing is serialized, nothing is hidden, nothing is arbitrary. The circular dependency isn't swept under a rug — it's expressed, compiled, and working.

```
Common layer:  Graph → serialized into chain → information lost → ceremony added
Libraries:     Graph → expressed directly     → information preserved → no ceremony
```

**The takeaway:** The Common layer was the right call _at the time_ — it was pragmatic, it shipped, and it kept the project moving. But it was always a workaround, and each new feature (bond variants, more storage domains) made the workaround more expensive. Libraries resolve the root cause, eliminating both the Common chain and the Internals monster in one move.

---

### Q10: "How would a complex cross-domain function like `_getTotalBalanceForAdjustedAt` work with libraries?"

**A:** This is one of the best examples to illustrate the difference, because `_getTotalBalanceForAdjustedAt` touches **6+ domains** and its current implementation is **invisible** — scattered across 6 inheritance layers via `super.` chains.

**What the function does:** Calculates the total ABAF-adjusted balance for a token holder at a historical timestamp. "Total" means it aggregates balance across multiple categories: regular ERC1410 balance + held amounts + cleared amounts + locked amounts + frozen amounts. Each category is adjusted by the ABAF factor at the requested timestamp.

**Current implementation (inheritance — `super.` chain):**

The function is declared as `virtual` in `Internals.sol` (line 1149), starts at `TotalBalancesStorageWrapper` (returns 0), and gets **progressively overridden** through 5 intermediate contracts, each adding one domain's balance:

```
_getTotalBalanceForAdjustedAt(account, timestamp)
  │
  │ ERC3643StorageWrapper2:                  ← Layer 6: + frozen
  │   return super._getTotalBalanceFor...() + _getFrozenAmountForAdjustedAt()
  │         │
  │         │ LockStorageWrapper1:            ← Layer 5: + locked
  │         │   return super._get...() + _getLockedAmountForAdjustedAt()
  │         │         │
  │         │         │ ClearingStorageWrapper2:  ← Layer 4: + cleared
  │         │         │   return super._get...() + _getClearedAmountForAdjustedAt()
  │         │         │         │
  │         │         │         │ HoldStorageWrapper2:  ← Layer 3: + held
  │         │         │         │   return super._get...() + _getHeldAmountForAdjustedAt()
  │         │         │         │         │
  │         │         │         │         │ ERC1410StandardStorageWrapper:  ← Layer 2: + balance
  │         │         │         │         │   return super._get...() + _balanceOfAdjustedAt()
  │         │         │         │         │         │
  │         │         │         │         │         │ TotalBalancesStorageWrapper:  ← Layer 1: base
  │         │         │         │         │         │   return 0
```

**To understand what this function actually computes, you must read 6 files.** The `super.` calls create a hidden chain where the composition is invisible from any single file. In each file, you see `super._getTotalBalanceForAdjustedAt() + myDomainAmount` — but which `super`? You need to mentally trace the C3 linearization to know the order.

Each domain helper (`_balanceOfAdjustedAt`, `_getHeldAmountForAdjustedAt`, etc.) internally calls:

```solidity
uint256 factor = _calculateFactor(_getAbafAdjustedAt(timestamp), _getLabaf(account));
return rawAmount * factor;
```

This means the function also crosses into the ABAF/Snapshots domain for every single balance type.

**With libraries — explicit composition:**

```solidity
library LibTotalBalance {
  function getTotalBalanceForAdjustedAt(address account, uint256 timestamp) internal view returns (uint256) {
    // ════════════════════════════════════════════════════
    // THE ENTIRE COMPOSITION IS VISIBLE IN ONE PLACE
    // ════════════════════════════════════════════════════

    // Get the ABAF factor at the requested timestamp
    uint256 abafAtTime = LibABAF.getAbafAt(timestamp);
    uint256 labaf = LibABAF.getLabaf(account);
    uint256 factor = LibABAF.calculateFactor(abafAtTime, labaf);

    // Aggregate ALL balance types — each call goes to ONE focused library
    uint256 total = 0;
    total += LibERC1410.rawBalanceOf(account) * factor; // regular balance
    total += LibHold.getHeldAmount(account) * factor; // held amounts
    total += LibClearing.getClearedAmount(account) * factor; // cleared amounts
    total += LibLock.getLockedAmount(account) * factor; // locked amounts
    total += LibFrozen.getFrozenAmount(account) * factor; // frozen amounts

    return total / (10 ** LibABAF.getDecimals());
  }
}
```

**What changed:**

| Aspect                                                | Inheritance (`super.` chain)                                                             | Libraries (explicit composition)                                      |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| **Where is the composition logic?**                   | Scattered across 6 files                                                                 | ONE function, ~15 lines                                               |
| **Can you see all domains involved?**                 | No — must trace C3 linearization                                                         | Yes — read the import list and function body                          |
| **Adding a new balance type** (e.g., pledged amounts) | Insert a new contract into the inheritance chain, hope the `super.` ordering still works | Add one line: `total += LibPledge.getPledgedAmount(account) * factor` |
| **ABAF factor calculated how many times?**            | 5 times (once per domain — each calls `_calculateFactor` independently)                  | 1 time (calculated once, reused for all domains)                      |
| **Auditing "is this correct?"**                       | Read 6 files, mentally reconstruct the chain                                             | Read 1 function                                                       |

**The complex example coverage:**

The building blocks for this pattern exist in the complex example (`lib-based-diamond-poc/contracts/complex-example/new/lib/`):

- `LibABAF.getAbafAt(timestamp)` — retrieves historical ABAF value (Layer 1)
- `LibABAF.calculateAdjustmentFactor(account, partition)` — computes the factor (Layer 1)
- `LibERC1410.adjustedBalanceOfByPartition(partition, account)` — current-time adjusted balance (Layer 1)
- `LibSnapshots.getSnapshotBalanceByPartition(snapshotId, partition, account)` — raw balance at snapshot (Layer 1)

These libraries demonstrate the circular call pattern (`LibERC1410 ↔ LibSnapshots`, `LibERC1410 → LibABAF`) that makes the composition possible. A `LibTotalBalance` library would sit at **Layer 2 (orchestrator)** — it coordinates multiple domain libraries to produce the aggregate result, exactly like `LibScheduledTasks` already does for the scheduled task workflow.

**Why this is a perfect argument for libraries:**

`_getTotalBalanceForAdjustedAt` is a function where the **composition IS the logic**. The individual domain lookups are simple (`rawBalance * factor`). The value is in seeing how they combine. With inheritance, the combination is invisible — hidden behind 6 levels of `super.` calls that you must mentally trace. With libraries, the combination is the function body — 15 lines that tell the full story.

---

## 7. Risk Assessment

### 7.1 Risk Matrix

| Risk                                 | Probability | Impact   | Mitigation                                |
| ------------------------------------ | ----------- | -------- | ----------------------------------------- |
| Migration introduces bugs            | Medium      | High     | Incremental migration, full test coverage |
| Team unfamiliar with pattern         | Low         | Medium   | Documentation, examples, pair programming |
| Migration takes longer than expected | Medium      | Medium   | Phased approach, parallel operation       |
| Stakeholder resistance               | Low         | Low      | This ADR with concrete evidence           |
| Performance regression               | Very Low    | High     | Bytecode comparison proves no change      |
| Storage incompatibility              | Very Low    | Critical | Same Diamond Storage pattern used         |

### 7.2 Risk Mitigations

**Bug introduction:**

- Migrate one facet at a time
- Full test suite must pass before switching
- Old and new facets coexist during transition
- Instant rollback via `diamondCut`

**Team learning curve:**

- Create comprehensive style guide
- Pair programming during initial migrations
- Code review requirements for library changes

---

## 8. Migration Strategy

### 8.1 Phased Approach

```
PHASE 1: FOUNDATION (Weeks 1-2)
├── Create/update shared storage file
├── Create core libraries (LibPause, LibAccess, LibCompliance, etc.)
├── Create test harnesses
├── Validate compilation
└── Deliverable: Core library set, passing tests

PHASE 2: PILOT (Weeks 3-4)
├── Migrate 3-5 representative facets
├── Full test coverage comparison
├── Benchmark compilation time
├── Team feedback session
└── Deliverable: Go/no-go decision for full migration

PHASE 3: FULL MIGRATION (Weeks 5-10)
├── Migrate remaining ~147 facets
├── Parallel deployment (old + new)
├── Gradual diamondCut switches
├── CI validation on every PR
└── Deliverable: All facets migrated, Internals.sol deprecated

PHASE 4: CLEANUP (Weeks 11-12)
├── Remove old facets from deployment
├── Delete Internals.sol
├── Update all documentation
├── Team training complete
└── Deliverable: Clean codebase, trained team
```

### 8.2 Effort Estimate

| Phase          | Duration     | Team Size | Effort                 |
| -------------- | ------------ | --------- | ---------------------- |
| Foundation     | 2 weeks      | 1 dev     | 2 person-weeks         |
| Pilot          | 2 weeks      | 2 devs    | 4 person-weeks         |
| Full Migration | 6 weeks      | 2-3 devs  | 12-18 person-weeks     |
| Cleanup        | 2 weeks      | 1 dev     | 2 person-weeks         |
| **Total**      | **12 weeks** | —         | **20-26 person-weeks** |

### 8.3 Success Criteria

| Metric           | Target               | Measurement            |
| ---------------- | -------------------- | ---------------------- |
| Bytecode size    | Within 1%            | Compile and compare    |
| Gas costs        | Identical            | Test suite gas reports |
| Test coverage    | 100% of migrated     | Coverage tools         |
| Compilation time | Equal or better      | CI metrics             |
| Team approval    | Majority after pilot | Survey                 |

---

## 9. Rollback Procedures

### 9.1 During Migration

If issues discovered with new facet:

```
1. DETECT: Tests fail or bug reported
2. ASSESS: Determine severity
3. ROLLBACK (if needed):
   a. diamondCut: Remove new facet selectors
   b. diamondCut: Add old facet selectors
   c. Verify: Run full test suite
4. INVESTIGATE: Debug new facet
5. FIX: Address issue
6. RETRY: Re-deploy fixed facet
```

**Time to rollback:** ~5 minutes (single transaction)

### 9.2 After Full Migration

If systemic issue discovered:

```
1. Old facets still exist in Git history
2. Redeploy old facets
3. diamondCut to switch back
4. Investigate and fix
```

### 9.3 Why Rollback is Safe

- **Storage unchanged:** Both architectures use same Diamond Storage slots
- **Interfaces unchanged:** Same external function signatures
- **Coexistence:** Old and new can run simultaneously during testing

---

## 10. Decision

### 10.1 Recommendation

**APPROVE** migration to library-based Diamond architecture with conditions:

1. ✅ Complete Phases 1-2 before committing to full migration
2. ✅ Meet all success criteria before Phase 3
3. ✅ Maintain rollback capability throughout
4. ✅ Update developer documentation

### 10.2 Decision Summary

| Criteria                  | Assessment                                         |
| ------------------------- | -------------------------------------------------- |
| Technical feasibility     | ✅ Proven via PoC                                  |
| Performance impact        | ✅ Zero (same bytecode/gas)                        |
| Code quality improvement  | ✅ Significant (~1,000 fewer lines, explicit deps) |
| Risk level                | ⚠️ Medium (mitigated by incremental approach)      |
| Effort required           | ⚠️ Moderate (20-26 person-weeks)                   |
| Long-term maintainability | ✅ Significantly improved                          |

### 10.3 Approval Chain

| Role                         | Decision | Date       |
| ---------------------------- | -------- | ---------- |
| Authors                      | Proposed | 2026-02-06 |
| Technical Reviewer (Alberto) | Reviewed | 2026-02-06 |
| Development Team             | Pending  | TBD        |
| Tech Lead                    | Pending  | TBD        |

---

## 11. Appendix

### 11.1 Proof-of-Concept Files

```
lib-based-diamond-poc/
├── contracts/
│   ├── circular-test/           # Circular dependency proofs
│   │   ├── LibA.sol, LibB.sol, LibC.sol
│   │   ├── LibCircularA.sol, LibCircularB.sol
│   │   └── TestCircularFunctions.sol
│   ├── storage-example/         # Storage access proof
│   │   └── StorageExample.sol
│   ├── real/                    # Real facet comparison (simple)
│   │   ├── storage/ERC1410Storage.sol
│   │   ├── old/
│   │   │   ├── Internals.sol
│   │   │   └── OldERC1410TokenHolderFacet.sol
│   │   └── new/
│   │       ├── lib/Lib*.sol
│   │       └── NewERC1410TokenHolderFacet.sol
│   └── complex-example/         # ★ Complex composition showcase
│       ├── storage/ComplexStorage.sol
│       ├── old/                 # Inheritance approach
│       │   ├── OldInternals.sol        (400+ lines, 10 sections, 60+ fns)
│       │   ├── OldCouponPaymentFacet.sol
│       │   ├── OldScheduledCrossOrderedTasksFacet.sol
│       │   └── OldAdjustBalancesFacet.sol
│       ├── new/                 # Library approach
│       │   ├── lib/
│       │   │   ├── LibPause.sol            (Layer 0 — leaf)
│       │   │   ├── LibAccess.sol           (Layer 0 — leaf)
│       │   │   ├── LibCompliance.sol       (Layer 0 — leaf)
│       │   │   ├── LibCorporateActions.sol (Layer 0 — leaf)
│       │   │   ├── LibABAF.sol             (Layer 1 — domain)
│       │   │   ├── LibERC1410.sol          (Layer 1 — domain)
│       │   │   ├── LibSnapshots.sol        (Layer 1 — domain)
│       │   │   ├── LibBond.sol             (Layer 1 — domain)
│       │   │   ├── LibScheduledTasks.sol   (Layer 2 — orchestrator)
│       │   │   └── LibInterestRate.sol     (Layer 2 — orchestrator)
│       │   └── facets/
│       │       ├── NewCouponPaymentFacet.sol              (Layer 3)
│       │       ├── NewScheduledCrossOrderedTasksFacet.sol  (Layer 3)
│       │       └── NewAdjustBalancesFacet.sol              (Layer 3)
│       └── COMPLEX_EXAMPLE.md   # Full documentation
├── ARCHITECTURE_COMPARISON.md
├── VISUAL_COMPARISON.md
├── ALBERTO_CONVERSATION_SUMMARY.md
└── ADR-LIBRARY-BASED-DIAMOND.md
```

The **complex-example** directory demonstrates the library layering architecture (Section 4.3) using the most demanding real-world workflow: a Green Bond coupon payment that exercises scheduled tasks, ABAF/LABAF adjustments, KPI-linked interest rates, snapshots, compliance checks, and corporate actions — all with circular dependencies between ERC1410 ↔ ABAF ↔ Snapshots.

### 11.2 References

- [EIP-2535: Diamond Standard](https://eips.ethereum.org/EIPS/eip-2535)
- [Solidity Libraries Documentation](https://docs.soliditylang.org/en/latest/contracts.html#libraries)
- [Diamond Storage Pattern](https://dev.to/mudgen/how-diamond-storage-works-90e)

### 11.4 Technical Review Summary (Alberto Molina)

The following is Alberto's technical review summary, originally added to the Confluence version on 2026-02-06.

**Comparison of the two approaches:**

We are comparing 2 solutions that both aim to solve the circular dependency issue:

- **Linear inheritance** where for each facet we have:
  - Virtual storage wrapper (all virtual SWs are linearly inherited in "Internals.sol")
  - Virtual modifiers (all virtual modifiers are linearly inherited in "Modifiers.sol")
  - Storage wrapper (implements all virtuals and modifiers associated to the facet)
  - Facet contract (inherits a single "Common.sol" where all asset functionality exists)

- **Library approach** where for each facet we have:
  - A SW contract that defines the facet's storage struct
  - A Library that implements all the facet functionality and imports all the libraries it needs
  - Facet contract (imports all the libraries it needs)

**Open points (Alberto) — now resolved:**

1. _"How would a method such as `_getTotalBalanceForAdjustedAt` work with libraries?"_
   — **Answered in [Q10](#q10-how-would-a-complex-cross-domain-function-like-_gettotalbalanceforadjustedat-work-with-libraries)**: The 6-layer `super.` chain becomes one 15-line explicit composition in `LibTotalBalance`.

2. _"How does the compiler handle the circular dependency between library methods?"_
   — **Answered in [Q2](#q2-wont-circular-imports-fail) and [Q3](#q3-wont-circular-function-calls-cause-infinite-loops)**: `import` only requires function signatures (not full structure), so circular imports compile. Circular function calls work as mutual recursion with base cases. Proven in `lib-based-diamond-poc/contracts/circular-test/`.

### 11.3 Version History

| Version | Date       | Author | Changes                                                                                                                                                                                                                                                          |
| ------- | ---------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0     | 2026-02-06 | Miguel | Initial draft                                                                                                                                                                                                                                                    |
| 2.0     | 2026-02-06 | Miguel | Added TL;DR, glossary, visual diagrams, FAQ, estimates                                                                                                                                                                                                           |
| 3.0     | 2026-02-06 | Miguel | Added risk matrix, rollback procedures, decision summary, polish                                                                                                                                                                                                 |
| 4.0     | 2026-02-07 | Miguel | Added Library Layering Architecture (§4.3), FAQ Q6 (spaghetti code / domain isolation analysis), FAQ Q7 (why inheritance can't achieve the same), complex example reference, updated appendix                                                                    |
| 5.0     | 2026-02-09 | Miguel | Corrected historical narrative: Common layer was the original circular dependency workaround, Internals.sol was added later for bond variant generation. Updated §1.1, §3, Q7, Q8 to reflect accurate evolution. Added Q9 (Common layer retrospective analysis). |
| 5.1     | 2026-02-09 | Miguel | Added Q10: Real-world case study of `_getTotalBalanceForAdjustedAt` — how a 6-layer `super.` chain becomes one 15-line explicit composition with libraries.                                                                                                      |
| 5.2     | 2026-02-09 | Miguel | Merged Alberto's technical review summary from Confluence (§11.4). Open points now cross-referenced to Q2/Q3 and Q10.                                                                                                                                            |

---

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                              END OF DOCUMENT                                  ║
║                                                                               ║
║  This ADR recommends APPROVAL of the library-based migration.                 ║
║  Next step: Team review and pilot phase approval.                             ║
╚══════════════════════════════════════════════════════════════════════════════╝
```
