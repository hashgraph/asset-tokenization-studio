# Events

Four concerns govern events: **where they are emitted** (ATS-EVENT-006), **where they are
declared** (ATS-EVENT-007), **how they are imported** (ATS-EVENT-008), and **which parameters
are `indexed`** (ATS-EVENT-010) — plus declaration hygiene (ATS-EVENT-002/009) and completeness
(ATS-EVENT-003). Initializer events (ATS-EVENT-005) live in
[architecture.md](architecture.md) § Facet initialization.

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

### ATS-EVENT-001 — Numeric amount indexed in an event (retired)

- Merged into **ATS-EVENT-010**, which owns the full `indexed`-selection policy. An indexed
  amount is the Rule 2 case (a value that is _read_, not _searched_). Report it under
  ATS-EVENT-010.

### ATS-EVENT-002 — Event parameter has `_` prefix

- Enforced by `solhint-plugin-ats/rules/event-param-no-underscore.js`.

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

### ATS-EVENT-004 — Event declared on a shared types interface (single-facet event) (retired)

- Merged into **ATS-EVENT-007** to remove a severity clash: a single-facet event sitting in a
  `*Types` file is exactly the _premature promotion_ case, which ATS-EVENT-007(b) classes as a
  **WARNING** ("consider relocating"), not an ERROR. Report it under ATS-EVENT-007(b).

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

## Indexed parameters

### ATS-EVENT-010 — Wrong `indexed` selection on an event parameter

- Severity: ERROR
- Enforcement: MANUAL (one deterministic slice is automatable — see Automation note)
- Pattern: an `event` whose `indexed` markers do not follow the policy below. Marking a
  parameter `indexed` stores it in the log topics instead of the data section, which has three
  consequences: (a) it enables off-chain filtering by that value — the _only_ thing `indexed`
  provides; (b) there is a hard cap of 3 indexed parameters per event (topic 0 is the
  signature); (c) for a dynamic type only its `keccak256` hash is stored, so the value is
  unrecoverable from the log (equality checks only).
- Decision procedure — audit each event in order:
  1. **Standard event?** Events from an implemented standard (ERC-20, ERC-1400/1410/1594/1643/
     1644, ERC-3643/T-REX, OpenZeppelin `RoleGranted`/`DelegateChanged`/…) keep the standard's
     exact `indexed` layout, even where it contradicts the rules below — then stop. Changing it
     breaks explorers, indexers and libraries. Examples left as-is: `Transfer.value` /
     `Approval.value` non-indexed (ERC-20); `ControllerTransfer.controller`,
     `ControllerRedemption.controller`/`value` (ERC-1644); `DelegateVotesChanged.*Balance` (OZ).
  2. **Would a consumer _filter_ by this field** (search for every event with that exact value)?
     - Yes → index candidate, in this priority order: (i) the entity ID (`corporateActionId`,
       `dividendId`, `couponId`, `amortizationId`, `holdId`, `clearingId`, `partition`,
       `configurationId`, `role`); (ii) actor addresses (`operator`, `from`, `to`, `account`,
       `tokenHolder`, `controller`); (iii) addresses of wired contracts (`kycList`,
       `controlList`, `pause`, `compliance`, `identityRegistry`).
     - No → leave it non-indexed. A field that is only _read_ once the event is found is never a
       key: amounts (`amount`, `value`, `balance`, `maxSupply`, `factor`), dates (`recordDate`,
       `executionDate`, `expirationDate`), numeric config (`rate`, `decimals`, `version`) and
       bool state flags (`isFrozen`, `clearingActive`, `controllable`, `activated`,
       `isWhiteList`).
  3. **Dynamic type?** (`string`, `bytes`, arrays, structs) → do NOT index: the topic holds only
     the hash, so the value is lost and only equality checks remain. Exception: a standard that
     defines the field `indexed` (e.g. ERC-3643 `UpdatedTokenInformation.newName`/`newSymbol` —
     `string indexed` — whose value is still readable via `name()`/`symbol()`).
  4. **More than 3 candidates** → keep the 3 most useful by the priority order in Rule 2
     (entity ID > actor > wired contract). **Fewer than 3** → index only the real keys; do not
     pad free slots with payload data just to use them.
- Rationale: `indexed` exists for filtering, not for gas. Indexing a field nobody searches by
  wastes one of the 3 slots and adds nothing.
- Fix: add/remove `indexed` so the markers match the procedure above (and the matching `@param`
  tags stay accurate).
- Automation note: solhint's `gas-indexed-events` suggests indexing fixed-size fields purely
  for a marginal gas saving — those suggestions are rejected by this convention and the rule is
  disabled in `solhint.config.js`. The only slice of EVENT-010 that is deterministically
  checkable is Rule 3 (a dynamic-type parameter marked `indexed`, outside a small standard
  allowlist); the filter-vs-read judgement (Rules 1–2, 4) needs semantics and stays manual.

## Review methodology

When reviewing event changes, work through this checklist in order:

1. **Inventory**: list every event introduced/modified, where it is declared, and every site
   that emits or references it.
2. **Source** (ATS-EVENT-009): for each new event, does an implemented standard already define
   one for this state change? If yes, the standard event (exact signature) must be used; if
   no, does the name follow `<Subject><PastParticiple>`?
3. **Emit site** (ATS-EVENT-006): facet by default; if lower, which of the four justifications
   applies? Check for cross-facet duplication explicitly.
4. **Declaration** (ATS-EVENT-007): count references; is the location correct for that
   count?
5. **Indexing** (ATS-EVENT-010): standard event → keep its layout; otherwise mark `indexed`
   only the fields a consumer would filter by (entity ID > actor > wired contract, max 3), never
   amounts/dates/flags or dynamic types.
6. **Imports** (ATS-EVENT-008): does any file import a foreign facet interface to reach an
   event? Does every import correspond to a type actually used?
7. **Synthesis**: note where a single root cause (e.g. a missing `*Types` promotion) produces
   violations across several rules, and prescribe the one fix that resolves them together.
