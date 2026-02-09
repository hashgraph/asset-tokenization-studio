# Complex Example: Green Bond with KPI-Linked Coupons

## The Scenario

A **Green Bond** is tokenized on-chain. This bond has:

- **KPI-linked interest rates**: The coupon rate adjusts based on environmental KPI reports from monitored projects.
- **Scheduled tasks**: Balance adjustments, snapshots, and coupon listings are scheduled and execute in chronological order.
- **ABAF/LABAF system**: Stock splits and consolidations apply lazily to all holders via a global factor.
- **Cross-ordered task orchestration**: Snapshots happen BEFORE coupon listings. Adjustments happen BEFORE snapshots. Order matters.

This is the **most complex workflow** in the ATS system because it touches **every domain simultaneously**.

---

## The Coupon Payment Flow

When `executeCouponPayment(couponId)` is called, here's what happens:

```
executeCouponPayment(couponId)
  │
  ├── 1. AUTHORIZATION
  │     ├── Check caller has COUPON_MANAGER_ROLE
  │     └── Check system is not paused
  │
  ├── 2. TRIGGER PENDING SCHEDULED TASKS (cross-ordered)
  │     │   Tasks execute in chronological order:
  │     │
  │     ├── [t=1000] BALANCE_ADJUSTMENT: 2:1 split
  │     │     ├── ABAF updates: 1e18 → 2e18
  │     │     └── Corporate action recorded
  │     │
  │     ├── [t=1100] SNAPSHOT: pre-coupon
  │     │     ├── Records ABAF at snapshot time
  │     │     ├── Records all holder addresses
  │     │     └── Corporate action recorded
  │     │
  │     └── [t=1200] COUPON_LISTING: coupon #3
  │           ├── Takes another snapshot
  │           └── Links snapshot to coupon
  │
  ├── 3. CALCULATE KPI-LINKED INTEREST RATE
  │     ├── Read KPI reports from monitored projects
  │     ├── Compare to baseline (environmental target)
  │     ├── Deviation → rate adjustment
  │     ├── No report → missed penalty applied
  │     └── Clamp to [minRate, maxRate]
  │
  ├── 4. TAKE RECORD-DATE SNAPSHOT
  │     ├── Snapshot ID assigned
  │     ├── ABAF recorded at this point
  │     ├── All holders captured
  │     └── Linked to coupon
  │
  ├── 5. CALCULATE PAYMENT PER HOLDER
  │     └── For each holder:
  │           ├── Check KYC compliance
  │           ├── Get balance at snapshot (ABAF-adjusted)
  │           └── payment = balance × rate / 10^rateDecimals
  │
  └── 6. FINALIZE
        ├── Mark coupon as EXECUTED
        └── Register corporate action (audit trail)
```

---

## Why This Example Destroys the Internals Monster

### The Circular Dependency Web

This flow creates a **dependency web** that makes circular inheritance inevitable:

```
CouponPayment needs:
  ├── ScheduledTasks (to trigger pending tasks)
  │     ├── ABAF (for balance adjustments)
  │     │     └── ERC1410 (to read/write raw balances)  ←─┐
  │     ├── Snapshots (for snapshot tasks)                 │
  │     │     ├── ABAF (to record ABAF at snapshot)       │
  │     │     └── ERC1410 (to get holders)  ←──────────────┤
  │     └── Bond (for coupon listing)                      │
  ├── InterestRate (to calculate rate)                     │
  │     └── Bond (for previous coupon data)                │
  ├── Snapshots (for record-date snapshot)                 │
  │     └── ERC1410 (to get holders)  ←────────────────────┤
  ├── Bond (for coupon data)                               │
  ├── Compliance (for KYC checks)                          │
  └── ERC1410 (for adjusted balances)                      │
        └── ABAF (for adjustment factor)                   │
              └── ERC1410 (to sync raw balances)  ─────────┘
                     CIRCULAR!
```

**In the OLD architecture**: ALL of these live in `OldInternals.sol` — 400+ lines.
Every facet inherits the entire monster, even if it uses 5 functions.

**In the NEW architecture**: 10 focused libraries, each 22-95 lines.
Libraries call each other freely — no circular dependency problem.

---

## Library Layering: Why This Is Not Spaghetti

A natural question when seeing 10 libraries calling each other (some circularly) is: *"Isn't this just spaghetti code with extra steps?"*

The answer is no — and the reason is **layering**. The libraries aren't a flat web. They organize into clean architectural tiers:

```
LAYER 3 — FACETS (thin orchestration, zero business logic)
    NewCouponPaymentFacet           → imports 8 libs
    NewScheduledCrossOrderedTasksFacet → imports 3 libs
    NewAdjustBalancesFacet          → imports 6 libs

LAYER 2 — ORCHESTRATOR LIBRARIES (coordinate domain libs)
    LibScheduledTasks  → calls LibABAF, LibSnapshots, LibBond, LibCorporateActions
    LibInterestRate    → calls LibBond

LAYER 1 — DOMAIN LIBRARIES (own one domain, may cross-call peers)
    LibERC1410    ↔  LibSnapshots   (circular — works with libraries!)
    LibABAF          LibBond

LAYER 0 — LEAF LIBRARIES (zero library dependencies, pure utilities)
    LibPause    LibAccess    LibCompliance    LibCorporateActions
```

**Each layer has a contract with the developer:**

- **Layer 0** libraries import nothing. They're guaranteed safe, simple, side-effect-free within their domain. Anyone can read them in 2 minutes.
- **Layer 1** libraries may import *peer* domain libraries when the interaction is natural (transfers need ABAF sync, snapshots need holder lists). Circular calls are allowed here — this is where the library architecture shines over inheritance.
- **Layer 2** libraries orchestrate multiple domain libraries. They define *workflow* (first adjust, then snapshot, then link coupon) without implementing domain logic.
- **Layer 3** facets are the thinnest possible wrappers: check auth, check pause, call libraries, emit events.

**The anti-pattern is a library that skips layers.** A leaf library importing an orchestrator, or an orchestrator writing directly to storage — those are code review red flags. The import list makes violations immediately visible.

**Contrast with the old architecture:** There ARE no layers. The Common chain serializes unrelated storage domains into an arbitrary linear order, and `_pause()` (leaf-level) sits next to `_executeScheduledTask()` (orchestrator-level) in the same Internals file. No structural hint of what orchestrates what.

### Compiler-Enforced Domain Isolation

Import lists act as **compile-time boundaries**:

- `NewScheduledCrossOrderedTasksFacet` imports 3 libs. It literally *cannot* call `LibBond.setCoupon()` or `LibERC1410.issueByPartition()` — the compiler rejects it.
- `OldScheduledCrossOrderedTasksFacet` inherits `OldInternals` and *can* call any of 60+ functions. Nothing prevents this at compile time.

Libraries turn domain isolation from a convention into a structural guarantee.

### Why Not Fix Inheritance Instead?

You could restructure inheritance into smaller abstract contracts for non-circular parts (Pause, Access, Compliance). But the moment you need `ERC1410 ↔ ABAF ↔ Snapshots`, Solidity's C3 linearization rejects the circular chain. The ATS codebase tried two successive approaches: first the Common layer (serializing all storage into one chain), then Internals.sol on top (for bond variant virtual dispatch). Both are workarounds, not solutions. Libraries are the only approach that resolves circular dependencies structurally. See ADR FAQ Q7 for the full analysis.

---

## Library Composition Graph

```
┌────────────────────────────────────────────────────────────────┐
│                      FACET LAYER                                │
│                                                                 │
│  NewCouponPaymentFacet ──────────────────────────────────────  │
│    imports: LibPause, LibAccess, LibCompliance,                 │
│            LibScheduledTasks, LibBond, LibInterestRate,         │
│            LibSnapshots, LibCorporateActions                    │
│                                                                 │
│  NewScheduledCrossOrderedTasksFacet ─────────────────────────  │
│    imports: LibPause, LibAccess, LibScheduledTasks              │
│                                                                 │
│  NewAdjustBalancesFacet ─────────────────────────────────────  │
│    imports: LibPause, LibAccess, LibABAF,                       │
│            LibCorporateActions, LibScheduledTasks, LibERC1410   │
└────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────────────┐
│                    LIBRARY LAYER                                │
│                                                                 │
│  ┌──────────────────┐    ┌───────────────────┐                 │
│  │ LibScheduledTasks │    │  LibInterestRate  │                 │
│  │ (orchestrator)    │    │  (calculator)     │                 │
│  │                   │    │                   │                 │
│  │ calls:            │    │ calls:            │                 │
│  │  ├─ LibABAF       │    │  └─ LibBond       │                 │
│  │  ├─ LibSnapshots  │    └───────────────────┘                 │
│  │  ├─ LibBond       │                                          │
│  │  └─ LibCorpActions│    ┌───────────────────┐                 │
│  └──────────────────┘    │  LibERC1410        │                 │
│                           │  (token engine)    │                 │
│  ┌──────────────────┐    │                    │                 │
│  │  LibSnapshots     │◄──►│ calls:             │                 │
│  │  (point-in-time)  │    │  ├─ LibABAF       │                 │
│  │                   │    │  └─ LibSnapshots   │                 │
│  │ calls:            │    └───────────────────┘                 │
│  │  ├─ LibABAF       │                                          │
│  │  └─ LibERC1410    │    ┌───────────────────┐                 │
│  └──────────────────┘    │  LibABAF           │                 │
│                           │  (adjustment math)  │                 │
│  LEAF LIBRARIES:          │                    │                 │
│  ┌─────────┐ ┌─────────┐ │ reads:             │                 │
│  │LibPause │ │LibAccess│ │  └─ tokenStorage() │                 │
│  │ 37 LOC  │ │ 42 LOC  │ └───────────────────┘                 │
│  └─────────┘ └─────────┘                                        │
│  ┌────────────┐ ┌──────────────────┐ ┌──────────┐             │
│  │LibCompliance│ │LibCorporateActions│ │ LibBond  │             │
│  │   22 LOC    │ │      28 LOC       │ │  65 LOC  │             │
│  └────────────┘ └──────────────────┘ └──────────┘             │
└────────────────────────────────────────────────────────────────┘
```

### Key Insight: Circular Calls Work!

```
LibERC1410 ────calls────► LibSnapshots.updateAccountSnapshot()
LibSnapshots ──calls────► LibERC1410.rawBalanceOfByPartition()

LibERC1410 ────calls────► LibABAF.syncBalanceAdjustments()
LibABAF ───reads────────► tokenStorage() (same storage, no import needed)
```

These circular call patterns **compile perfectly** with libraries because
libraries are resolved at link-time, not at inheritance-time.

---

## Side-by-Side: OLD vs NEW

### Question: "What can CouponPaymentFacet do?"

**OLD (OldInternals):**
```
Contract inherits: OldInternals (400+ lines)
Answer: Read all 400+ lines to find out.
Available: pause, unpause, grantRole, revokeRole, transfer, issue,
           redeem, adjustBalances, takeSnapshot, calculateRate,
           registerCorporateAction, scheduleTask, ...60+ functions.
Time: 15-30 minutes to audit.
```

**NEW (Libraries):**
```
Imports: LibPause, LibAccess, LibCompliance, LibScheduledTasks,
         LibBond, LibInterestRate, LibSnapshots, LibCorporateActions
Answer: 8 libraries × ~50 lines each = ~400 lines, BUT FOCUSED.
         Each library does ONE thing. Read the names.
Time: 2-3 minutes to understand scope, 15 minutes to audit.
```

### Question: "If I change LibABAF.updateAbaf(), what's affected?"

**OLD:**
```bash
$ grep -r "_updateAbaf" packages/ats/contracts/
# Returns: Every file that inherits OldInternals = ALL 152 facets.
# REAL answer: Only 3 facets actually call it. But you can't tell.
```

**NEW:**
```bash
$ grep -r "LibABAF" lib-based-diamond-poc/contracts/complex-example/new/
# Returns: EXACTLY the files that import it:
#   LibScheduledTasks.sol  (calls updateAbaf in executeTask)
#   LibERC1410.sol         (calls syncBalanceAdjustments in transfer)
#   NewAdjustBalancesFacet.sol (calls updateAbaf and getAbaf)
```

### Question: "How does a balance adjustment propagate through the system?"

**OLD:**
Read `_updateAbaf()` (section 5) → realize `_syncBalanceAdjustments()` is also in section 5 → realize it modifies `tokenStorage()` (section 4) → realize `_adjustedBalanceOfByPartition()` (section 4) uses `_getAbaf()` (section 5) → realize snapshots call `_getAbaf()` too (section 6).

**You just read across 3 sections of a 400-line file to trace one operation.**

**NEW:**
Open `LibABAF.sol` (75 lines). Read it. Done.
It writes to `abafStorage()` and reads `tokenStorage()`. Both are in `ComplexStorage.sol`.
Now check who calls it: `grep "LibABAF"`. That's the blast radius.

---

## The ABAF/LABAF Deep Dive

### Why It's Complex

A 2:1 stock split means everyone's balance doubles. Naive approach:

```
for (i = 0; i < holderCount; i++) {          // 10,000 holders
    for (j = 0; j < partitions.length; j++) { // 3 partitions each
        balances[partition][holder] *= 2;      // 30,000 SSTOREs = $$$
    }
}
```

ABAF approach:

```
ABAF *= 2;  // 1 SSTORE. Done.

// Later, when holder queries balance:
adjustedBalance = rawBalance × (ABAF / LABAF);  // LABAF = holder's last-seen ABAF

// On transfer, sync first:
rawBalance = rawBalance × (ABAF / LABAF);
LABAF = ABAF;
```

### Why It Creates Circular Dependencies

```
ERC1410.adjustedBalance() needs ABAF.getAbaf()
  → ERC1410 depends on ABAF

ABAF.syncBalanceAdjustments() writes to tokenStorage().partitionBalances
  → ABAF depends on ERC1410's storage

ERC1410.transfer() calls ABAF.sync() then updates snapshots
  → ERC1410 depends on ABAF AND Snapshots

Snapshots.takeSnapshot() reads ERC1410.tokenHolderCount()
  → Snapshots depends on ERC1410

ERC1410.transfer() calls Snapshots.updateAccountSnapshot()
  → ERC1410 depends on Snapshots

CIRCULAR: ERC1410 ↔ ABAF ↔ Snapshots ↔ ERC1410
```

**Old solution (two layers):** First, the Common layer serialized all storage wrappers into one inheritance chain to avoid circular deps. Then, when bond variants were needed, `Internals.sol` was added on top with 1,456 virtual declarations. The result: both Common chain AND Internals monster carry the entire dependency graph, flattened and hidden.

**New solution:** Libraries call each other freely:
- `LibERC1410` calls `LibABAF.sync()` — ✅ compiles
- `LibABAF` reads `tokenStorage()` directly — ✅ no import of LibERC1410 needed
- `LibSnapshots` calls `LibERC1410.getTokenHolders()` — ✅ compiles
- `LibERC1410` calls `LibSnapshots.updateAccountSnapshot()` — ✅ circular, but compiles!

---

## Line Count Comparison

### OLD Architecture

| File | Lines | What's in it |
|------|-------|-------------|
| OldInternals.sol | 400+ | **Everything**: pause, access, compliance, ERC1410, ABAF, snapshots, bond, interest rate, scheduled tasks, corporate actions |
| OldCouponPaymentFacet.sol | 85 | Coupon payment logic |
| OldScheduledCrossOrderedTasksFacet.sol | 55 | Task triggering |
| OldAdjustBalancesFacet.sol | 65 | Balance adjustment |
| **Total** | **~605** | 1 monster + 3 facets |

### NEW Architecture

| File | Lines | Responsibility |
|------|-------|---------------|
| LibPause.sol | 37 | Pause control |
| LibAccess.sol | 42 | Role management |
| LibCompliance.sol | 22 | KYC verification |
| LibERC1410.sol | 95 | Partitioned tokens |
| LibABAF.sol | 75 | Lazy balance adjustments |
| LibSnapshots.sol | 70 | Point-in-time snapshots |
| LibBond.sol | 65 | Bond & coupon data |
| LibInterestRate.sol | 85 | KPI-linked rate calc |
| LibScheduledTasks.sol | 80 | Cross-ordered task execution |
| LibCorporateActions.sol | 28 | Audit trail |
| NewCouponPaymentFacet.sol | 100 | Coupon payment orchestration |
| NewScheduledCrossOrderedTasksFacet.sol | 50 | Task triggering |
| NewAdjustBalancesFacet.sol | 80 | Balance adjustment |
| **Total** | **~829** | 10 libraries + 3 facets |

### Wait — the NEW approach has MORE lines?

Yes! And that's **the right trade-off**:

- **OLD**: 400 lines in ONE file. Good luck finding what you need.
- **NEW**: 829 lines across 13 files. Each file does ONE thing. Find anything in seconds.

The extra lines are:
1. Import statements (explicit dependencies — this is a FEATURE)
2. Library declarations and NatSpec
3. Explicit storage accessor calls (vs implicit `this.` inheritance)

What you GET for those extra lines:
- ✅ Auditor reads ONE 75-line file to understand ABAF (not 400)
- ✅ `grep "LibABAF"` gives you the exact blast radius of a change
- ✅ Each library is independently unit-testable
- ✅ Circular dependencies work naturally
- ✅ IDE autocomplete shows 6-8 relevant functions, not 60+

---

## File Structure

```
complex-example/
├── storage/
│   └── ComplexStorage.sol          # Shared storage (both architectures)
├── old/
│   ├── OldInternals.sol            # THE MONSTER (400+ lines, 10 sections)
│   ├── OldCouponPaymentFacet.sol   # Inherits monster, uses ~15 functions
│   ├── OldScheduledCrossOrderedTasksFacet.sol  # Inherits monster, uses ~6
│   └── OldAdjustBalancesFacet.sol  # Inherits monster, uses ~5
└── new/
    ├── lib/
    │   ├── LibPause.sol            # 37 lines — pause control
    │   ├── LibAccess.sol           # 42 lines — role management
    │   ├── LibCompliance.sol       # 22 lines — KYC checks
    │   ├── LibERC1410.sol          # 95 lines — partitioned tokens
    │   ├── LibABAF.sol             # 75 lines — ABAF/LABAF adjustments
    │   ├── LibSnapshots.sol        # 70 lines — balance snapshots
    │   ├── LibBond.sol             # 65 lines — bond & coupon data
    │   ├── LibInterestRate.sol     # 85 lines — KPI-linked rates
    │   ├── LibScheduledTasks.sol   # 80 lines — cross-ordered tasks
    │   └── LibCorporateActions.sol # 28 lines — audit trail
    └── facets/
        ├── NewCouponPaymentFacet.sol              # 100 lines
        ├── NewScheduledCrossOrderedTasksFacet.sol  #  50 lines
        └── NewAdjustBalancesFacet.sol              #  80 lines
```
