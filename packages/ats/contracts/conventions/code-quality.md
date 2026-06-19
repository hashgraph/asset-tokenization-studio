# Code Quality — Errors, Imports & Types, Gas, NatSpec, Linting

Cross-cutting source-level conventions that apply to every `.sol` file regardless of layer.

## Custom errors & reverts

### ATS-ERR-001 — `require()` with a string message

- Enforced by solhint built-in `gas-custom-errors`.

### ATS-TYPE-002 — Custom error outside the reverting facet's interface

- Severity: ERROR
- Enforcement: MANUAL
- Pattern: a custom `error` declared in a file that is not the interface of the facet that
  reverts with it, and not `ICommonErrors` (for cross-domain errors).
- Fix: move the error to the writer interface of the facet that uses it, or to `ICommonErrors`
  when several domains revert with it.

## Imports & type placement

### ATS-IMP-001 — Bare import (no named symbols)

- Enforced by solhint built-in `no-global-import`.

### ATS-TYPE-001 — Type placement violation

- Severity: ERROR
- Enforcement: MANUAL
- Pattern: a `struct` or `enum` used by exactly one facet declared in a shared `I*Types.sol`
  (should be inline on that facet's interface); or a type used by 2+ facets declared inline on
  a single facet interface (should be in a shared `I*Types.sol`).
- Fix: move the type to the correct location based on usage count — single-facet types live on
  the facet's writer interface; shared types live in the domain's `I*Types.sol`.

Related: events and errors follow the same single-vs-shared placement logic — see
[events.md](events.md) ATS-EVENT-007 and ATS-TYPE-002 above. The ERC-3643 import boundary
is in [architecture.md](architecture.md) ATS-BOUND-001.

## Gas patterns

### ATS-GAS-001 — Post-increment `i++` instead of `++i`

- Enforced by solhint built-in `gas-increment-by-one`.

### ATS-GAS-002 — Loop without `unchecked` counter increment

- Enforced by `solhint-plugin-ats/rules/loop-unchecked-increment.js`.

### ATS-FUNC-001 — `memory` parameter in an `external` function where `calldata` is possible

- Enforced by solhint built-in `gas-calldata-parameters`.

Note: the descending `unchecked` selector-registration pattern for
`getStaticFunctionSelectors` is also gas-motivated — see
[architecture.md](architecture.md) ATS-SEL-001.

## NatSpec

The authoring tool for NatSpec is the `/solidity-natspec` skill
(`.claude/skills/solidity-natspec/`) — house style: British English, ≤100-char comment lines,
present tense, intent-focused, `@title`/`@author`/`@notice` mandatory on contract headers,
`@inheritdoc` on interface implementations, `@custom:storage-location` as the last tag inside
the struct's NatSpec block. The rule below covers what solhint does not.

### ATS-NATSPEC-001 — Missing NatSpec on `private` or `internal` callable

- Severity: ERROR
- Enforcement: MANUAL
- Pattern: a `private` or `internal` function, modifier, or constructor with no NatSpec block
  (neither `/** */` block nor `///` line tags). Solhint's `use-natspec` only warns on
  `external`/`public` — this rule covers the unreported gap.
- Fix: add at minimum a `@notice` line describing intent and a `@dev` line covering
  preconditions or implementation constraints.

## Linting policy

Solhint (`packages/ats/contracts/solhint.config.js`) is the first line of defence — run it on
every touched `.sol` file.

### ATS-LINT-001 — `solhint-disable` comment added

- Enforced by `solhint-plugin-ats/rules/no-solhint-disable.js`.
