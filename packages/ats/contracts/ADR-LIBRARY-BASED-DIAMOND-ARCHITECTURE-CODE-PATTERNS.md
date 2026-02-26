# ADR: Library-Based Diamond Architecture — Code Patterns and Architectural Critique Analysis

## Table of Contents

- [Overview](#overview)
- [Architecture Summary](#architecture-summary)
- [Architectural Critique Analysis](#architectural-critique-analysis)
  - [1. SOLID Principles Compliance](#1-solid-principles-compliance)
  - [2. Domain-Driven Design Alignment](#2-domain-driven-design-alignment)
  - [3. Libraries vs Abstract Contracts — Maturity Concern](#3-libraries-vs-abstract-contracts--maturity-concern)
  - [4. Code Traceability and Maintainability](#4-code-traceability-and-maintainability)
  - [5. Storage Domain Boundaries](#5-storage-domain-boundaries)
- [Why Not Abstract Contracts in a Diamond](#why-not-abstract-contracts-in-a-diamond)
- [Industry Alignment](#industry-alignment)
- [Conclusion](#conclusion)

---

## Overview

This document examines the library-based diamond architecture used in the ATS smart contracts and addresses common architectural critiques that may arise when evaluating this pattern against traditional object-oriented design principles.

The intent is to provide a clear technical rationale for the design decisions, acknowledge legitimate concerns, and explain why certain well-established OOP patterns do not transfer directly to the Solidity/EVM execution environment.

---

## Architecture Summary

The contracts follow a 4-layer separation:

| Layer             | Location                             | Role                                                                                                      |
| ----------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| **Storage**       | `storage/*StorageAccessor.sol`       | Named-slot structs + `pure` accessor functions. Zero logic.                                               |
| **Libraries**     | `lib/core/*.sol`, `lib/domain/*.sol` | `internal` functions operating on storage accessors. Inlined into callers.                                |
| **Orchestrators** | `lib/orchestrator/*.sol`             | `library` with `public` functions. Sequences multi-library calls. Deployed once, shared via delegatecall. |
| **Facets**        | `facets/**/*.sol`                    | Abstract contract (guards + lib calls) + concrete facet (diamond metadata).                               |

Each storage domain gets a deterministic, isolated `bytes32` slot. Libraries are stateless — they access storage exclusively through typed accessor functions. Facets compose libraries explicitly, with every dependency visible as a qualified call (`LibX.doY()`).

---

## Architectural Critique Analysis

### 1. SOLID Principles Compliance

**Concern**: _The library pattern may not adhere to SOLID principles, particularly Single Responsibility and Dependency Inversion._

**Analysis**:

| Principle                 | Assessment                                                                                                                                                                                                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Single Responsibility** | Each library has exactly one domain responsibility (`LibPause` → pausing, `LibAccess` → roles, `LibERC1410` → partitioned accounting). Libraries cannot hold state, which enforces purer separation than abstract contracts that merge state references with logic. |
| **Open/Closed**           | Facets are open for extension (new facets can compose any library combination) and closed for modification (libraries are immutable once deployed).                                                                                                                 |
| **Liskov Substitution**   | Not directly applicable — no inheritance hierarchy exists to violate. This is a structural advantage: LSP violations are impossible in a composition-based system.                                                                                                  |
| **Interface Segregation** | Each facet exposes a narrow, focused interface (`IPause`, `IERC20`, `IBond`). Libraries are implementation details behind these interfaces.                                                                                                                         |
| **Dependency Inversion**  | Facets depend on library function signatures (abstractions), not concrete storage layouts. Storage is accessed through typed accessor functions, not raw slot manipulation.                                                                                         |

**Conclusion**: The library pattern satisfies SOLID principles. The absence of a class hierarchy is not a SOLID violation — it is a characteristic of the composition model that actually prevents certain SOLID violations (particularly LSP and fragile base class issues).

---

### 2. Domain-Driven Design Alignment

**Concern**: _Libraries as stateless function collections may not properly represent domain concepts, violating DDD principles around rich domain models._

**Analysis**:

DDD prescribes:

- **Bounded Contexts**: Present — `lib/core/` (cross-cutting infrastructure), `lib/domain/` (business logic), `lib/orchestrator/` (coordination), `storage/` (persistence).
- **Aggregates**: The token proxy IS the aggregate root. All state mutations flow through it.
- **Domain Services**: That is exactly what `LibBond`, `LibERC1410`, `LibSnapshots` are — stateless services encapsulating domain operations that do not belong to a single entity.
- **Value Objects**: The storage structs serve as persisted value objects in named slots.
- **Ubiquitous Language**: `LibBond.setCoupon()`, `LibSnapshots.takeSnapshot()`, `LibHold.createHold()` — these read as domain language.

DDD does not mandate that domain logic resides inside "classes." Eric Evans defines Domain Services as stateless operations that don't naturally belong to any entity — which is precisely what Solidity libraries are. The modeling is correct; only the syntax differs from traditional OOP implementations.

**Conclusion**: The architecture follows DDD principles. The distinction between DDD (a design philosophy) and OOP (an implementation paradigm) is important — DDD can be correctly implemented through composition and services, not only through rich entity objects.

---

### 3. Libraries vs Abstract Contracts — Maturity Concern

**Concern**: _Using libraries instead of abstract contracts represents a regression to procedural programming, losing decades of object-oriented evolution._

**Analysis**:

This critique applies when evaluating general-purpose languages (Java, C#, TypeScript), where stateless utility classes with static methods genuinely are an anti-pattern and rich domain objects are preferred. However, the Solidity/EVM execution model is fundamentally different:

1. **No runtime objects exist.** A Solidity contract is a bytecode blob at an address. "Inheritance" is a compile-time flattening mechanism, not a runtime dispatch mechanism. Libraries and abstract contracts produce **identical bytecode** for `internal` functions.

2. **24KB contract size limit.** Deep inheritance trees bloat bytecode because every abstract contract inlines ALL its code into the child. With 40+ facets, size limits become a real constraint. Libraries inline only what is actually called.

3. **Diamond storage isolation.** In a diamond, ALL facets execute in the same storage context. If multiple abstract contracts inherit from a common storage base, storage slot collisions become possible. Free-function accessors (`pauseStorage()`, `erc20Storage()`) provide deterministic, per-domain slot isolation by design.

4. **C3 linearization complexity.** If facets inherit from 6+ abstract contracts, and those contracts share any common ancestor, Solidity's C3 linearization creates order-dependent resolution that is difficult to audit and fragile to refactor.

5. **No runtime polymorphism benefit.** Solidity `internal` functions are resolved at compile time regardless of whether they live in a library or an abstract contract. The "class" abstraction provides zero runtime benefit in this context.

**Conclusion**: The library pattern is not a regression — it is the appropriate tool for the execution environment. The diamond pattern already provides the "object" abstraction: the proxy IS the aggregate, facets ARE the methods, libraries ARE the domain services, storage accessors ARE the repositories.

---

### 4. Code Traceability and Maintainability

**Concern**: _Scattering logic across libraries will produce spaghetti code with tangled control flow._

**Analysis — Library approach (current)**:

```solidity
function transfer(...) external {
    LibERC1410.checkWithoutMultiPartition();              // explicit: ERC1410 lib
    LibProtectedPartitions.checkUnProtectedPartitions();  // explicit: partition lib
    LibERC1594.checkCanTransferFromByPartition(...);      // explicit: compliance lib
    return TokenCoreOps.transfer(...);                    // explicit: orchestrator
}
```

Every dependency is visible as a **qualified, namespaced call**. The control flow is linear, top-to-bottom, with zero hidden behavior. Any developer can read this function and know exactly what happens, in what order, and where each operation is implemented.

**Analysis — Abstract contract approach (alternative)**:

```solidity
contract ERC20Facet is ERC1410Logic, PartitionsLogic, ERC1594Logic, TokenCoreLogic {
    function transfer(...) external {
        _checkWithoutMultiPartition();         // which parent? needs IDE to resolve
        _checkUnProtectedPartitions();         // which parent? overridden somewhere?
        _checkCanTransferFromByPartition(...); // which parent?
        return _transfer(...);                 // which parent? maybe overridden?
    }
}
```

Issues:

- **Hidden dispatch**: `_checkWithoutMultiPartition()` could be in any of the parent contracts, or overridden by any intermediate one. Requires tracing C3 linearization mentally or with tooling.
- **Fragile base class**: Modifying any parent's internal function affects every inheritor, with the impact hidden in the inheritance tree.
- **State coupling**: If two parents read/write the same storage, the interaction is implicit and buried in the hierarchy.

**Conclusion**: The library approach produces more traceable, more auditable code. Explicit `LibX.doY()` qualification eliminates ambiguity. This is particularly important for security auditing, where implicit dispatch is a known source of vulnerabilities.

---

### 5. Storage Domain Boundaries

**Concern**: _Storage domains are unclear, with mixed responsibilities across accessor files._

**Analysis**:

Each storage accessor defines one or more structs, each mapped to its own **independent `bytes32` slot**:

| Accessor                      | Structs                   | Slots            |
| ----------------------------- | ------------------------- | ---------------- |
| `PauseStorageAccessor`        | `PauseDataStorage`        | 1 dedicated slot |
| `ERC20StorageAccessor`        | `ERC20Storage`            | 1 dedicated slot |
| `ERC1410StorageAccessor`      | `ERC1410Storage`          | 1 dedicated slot |
| `RolesStorageAccessor`        | `RolesStorage`            | 1 dedicated slot |
| `FinancialOpsStorageAccessor` | Lock, Hold, Clearing, Cap | 4 separate slots |
| `AssetTypeStorageAccessor`    | Bond, Equity, Regulation  | 3 separate slots |

Files like `FinancialOpsStorageAccessor` and `AssetTypeStorageAccessor` group related structs by domain affinity, but each struct maintains full slot isolation. This is a file-organization choice, not a responsibility coupling — the structs could be split into individual files with zero architectural impact.

With abstract contracts, storage isolation would be **harder** to guarantee. Each abstract contract would need to either use the same accessor functions (reverting to the current pattern) or define storage inline (creating classic diamond storage collision risks).

**Conclusion**: Storage boundaries are well-defined at the slot level. Co-location of related structs in a single accessor file is a readability choice, not a design flaw. The accessor pattern provides stronger isolation guarantees than inheritance-based storage.

---

## Why Not Abstract Contracts in a Diamond

For completeness, here is the concrete list of problems that deep abstract contract inheritance introduces in a 40+ facet diamond:

| Problem                           | Impact                                                                     | Library Alternative                                 |
| --------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------- |
| **C3 linearization complexity**   | Order-dependent function resolution across 6+ parents; fragile to refactor | No inheritance — explicit qualified calls           |
| **Fragile base class**            | Changing a parent's internal function silently affects all inheritors      | Libraries are stateless — changes are local         |
| **Bytecode bloat**                | Every parent's code is inlined into the child; 24KB limit pressure         | Only called functions are inlined                   |
| **Storage collision risk**        | Shared base contracts may use overlapping slots                            | Per-domain named slots with deterministic positions |
| **Hidden state coupling**         | Multiple parents reading/writing same storage implicitly                   | All storage access is explicit via typed accessors  |
| **Audit difficulty**              | Must trace full linearization to understand dispatch                       | `LibX.doY()` is unambiguous — grep-friendly         |
| **Diamond inheritance ambiguity** | The C++ "diamond problem" in Solidity's C3 linearization                   | No shared bases — no ambiguity                      |

---

## Industry Alignment

The library + composition approach aligns with the direction of major Solidity projects:

- **OpenZeppelin 5.x**: Moved toward more composable, less inheritance-heavy patterns
- **Solady**: Performance-focused library suite — pure library approach
- **Uniswap v4**: Hook-based composition over inheritance
- **EIP-2535 Reference Implementation**: Uses library-based storage (LibDiamond pattern)

The trend in the Solidity ecosystem is away from deep inheritance hierarchies and toward explicit composition with libraries.

---

## Conclusion

The library-based diamond architecture is a deliberate design choice driven by the constraints and characteristics of the EVM execution environment. It satisfies SOLID principles, aligns with DDD concepts, and produces more traceable code than the abstract contract alternative.

Critiques rooted in traditional OOP patterns from general-purpose languages (Java, C#, TypeScript) are valuable for those platforms but do not transfer directly to Solidity/EVM, where:

- There are no runtime objects
- Storage isolation is a first-class architectural concern
- Bytecode size limits constrain inheritance depth
- Security auditability demands explicit, unambiguous control flow

The key architectural question is not "libraries vs classes" in the abstract, but rather: **what pattern best serves a 40-facet diamond with shared storage, strict size limits, and high auditability requirements?** The library-based approach provides the strongest guarantees for all three.
