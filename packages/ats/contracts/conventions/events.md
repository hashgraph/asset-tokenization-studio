# Events

Three concerns govern events: **where they are emitted** (ATS-EVENT-006), **where they are
declared** (ATS-EVENT-004, ATS-EVENT-007), and **how they are imported** (ATS-EVENT-008) — plus
declaration hygiene (ATS-EVENT-001/002/009) and completeness (ATS-EVENT-003). Initializer
events (ATS-EVENT-005) live in [architecture.md](architecture.md) § Facet initialization.

## Declaration hygiene

### ATS-EVENT-009 — Standard event exists but a custom one was declared (or vice versa)

- Severity: ERROR
- Enforcement: MANUAL
- Pattern: choosing the wrong source for an event, in either direction:
  - (a) the implemented standard (ERC-20, ERC-1400 family, ERC-3643, ERC-2535, …) already
    defines an event for the state change, but a custom event is declared/emitted instead of —
    or alongside, with a different signature than — the standard one;
  - (b) the event is NOT defined by any implemented standard (internal/ATS-specific concern)
    but its name does not follow the house nomenclature.
- Rationale: standard events are the public contract that explorers, indexers and integrators
  listen for — they take precedence and must keep their exact standard signature. Only when no
  standard covers the situation do we declare our own, and then it must read like the rest of
  the codebase: PascalCase `<Subject><PastParticiple>` (e.g. `RoleGranted`, `BondDeployed`,
  `InterestRateUpdated`), subject first, past-tense verb last, no prefix.
- Fix: (a) emit the standard event with its exact standard signature and drop the custom
  duplicate; (b) rename the internal event to `<Subject><PastParticiple>` form.

### ATS-EVENT-001 — Numeric amount indexed in an event

- Severity: ERROR
- Enforcement: AUTOMATED
- Pattern: an `event` declaration that contains `uint256 indexed` (or any `uintN indexed` /
  `int256 indexed`) for a parameter that represents a quantity or amount rather than an
  identifier.
- Rationale: indexing amounts wastes bloom-filter slots and is almost never used for
  filtering; only addresses and natural keys (e.g. `bytes32 role`) should be indexed.
- Fix: remove `indexed` from the numeric parameter.

### ATS-EVENT-002 — Event parameter has `_` prefix

- Severity: ERROR
- Enforcement: AUTOMATED
- Pattern: an `event` declaration with a parameter name that starts with `_` (e.g.
  `event Paused(address indexed _operator)`).
- Rationale: event parameters use clean names without leading `_`. The ABI/topic hash depends
  on types only — not names — so this rename is non-breaking. Follows OpenZeppelin convention
  (`Transfer(address indexed from, ...)`).
- Fix: remove the `_` prefix from the event parameter name and its `@param` tag.

## Completeness

### ATS-EVENT-003 — State-changing external function emits no event

- Severity: ERROR
- Enforcement: MANUAL
- Pattern: an `external` non-`view`/non-`pure` function that writes to storage and contains no
  `emit` statement anywhere in its execution path.
- Fix: declare and emit a dedicated event for the state change on the writer interface.

## Emit site

### ATS-EVENT-006 — Event emitted below the facet layer without justification

- Severity: ERROR
- Enforcement: MANUAL
- Pattern: an `emit` in a lower layer (storage wrapper / `*Ops`) that is not covered by one of
  the four valid justifications below. (Overlaps with
  [architecture.md](architecture.md) ATS-ARCH-003 — report whichever fits the evidence best,
  not both.)
- Rationale: by default events are emitted from the facet. Lower-layer emissions are permitted
  ONLY when the emission point is shared by construction. The valid justifications are exactly:
  1. A multi-facet orchestrator emits the event.
  2. A wrapper is reused by several code paths.
  3. The event is a synthetic bookkeeping event.
  4. The emit is conditional on internal state not visible at the facet boundary.

  Hard prohibition: the same emit MUST NEVER be duplicated across multiple facets. Duplication
  is always a violation — the correct fix is to hoist the single emit into the shared lower
  layer.
- Fix: if none of the four justifications applies, move the emit up to the facet's
  business-logic layer. If the emit is duplicated across facets, hoist the single emit into
  the shared lower layer instead.

## Declaration location

### ATS-EVENT-007 — Event declared at the wrong location for its reference count

- Severity: ERROR (under-promotion) / WARNING (premature promotion)
- Enforcement: MANUAL
- Pattern: count every reference to the event — any `emit` plus any import/use of the event
  type, across facets, wrappers, AND orchestrators. Then:
  - (a) ERROR: an event declared in a facet interface but referenced by 2+ sites — it must be
    promoted to a cross-cutting `*Types` file.
  - (b) WARNING: an event placed in a `*Types` file while only one facet references it —
    consider relocating to that facet's interface.
- Fix: declare the event in the facet's writer interface (`I<Feature>.sol`) when exactly one
  facet references it; promote it to the domain's `*Types` file (`<Domain>Types.sol`) as soon
  as two or more references exist.

### ATS-EVENT-004 — Event declared on a shared types interface (single-facet event)

- Severity: ERROR
- Enforcement: MANUAL
- Pattern: an `event` declaration inside an `I*Types.sol` file that only a single facet emits
  or references.
- Fix: move the event to the writer interface (`I<Feature>.sol`) of the facet that emits it.

## Imports

### ATS-EVENT-008 — Foreign facet interface imported to reach an event

- Severity: ERROR
- Enforcement: MANUAL
- Pattern: a file imports another facet's interface solely to reference an event declared
  inside it. Also watch for transitive/incidental imports that drag in unrelated facet surface
  area.
- Rationale: each file imports ONLY the types it actually uses. Needing an event from a foreign
  facet interface is a strong signal that ATS-EVENT-007 was violated — the event should be
  promoted to a `*Types` file and imported from there.
- Fix: promote the event to the domain's `*Types` file, import it from there, and remove the
  foreign facet-interface import.

## Review methodology

When reviewing event changes, work through this checklist in order:

1. **Inventory**: list every event introduced/modified, where it is declared, and every site
   that emits or references it.
2. **Source** (ATS-EVENT-009): for each new event, does an implemented standard already define
   one for this state change? If yes, the standard event (exact signature) must be used; if
   no, does the name follow `<Subject><PastParticiple>`?
3. **Emit site** (ATS-EVENT-006): facet by default; if lower, which of the four justifications
   applies? Check for cross-facet duplication explicitly.
4. **Declaration** (ATS-EVENT-004/007): count references; is the location correct for that
   count?
5. **Imports** (ATS-EVENT-008): does any file import a foreign facet interface to reach an
   event? Does every import correspond to a type actually used?
6. **Synthesis**: note where a single root cause (e.g. a missing `*Types` promotion) produces
   violations across several rules, and prescribe the one fix that resolves them together.
