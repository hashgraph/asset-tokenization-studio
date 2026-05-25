---
name: solidity-natspec
description: Produce and validate comprehensive NatSpec documentation on Solidity files. Use whenever a `.sol` file is created or modified — contracts, interfaces, libraries, facets under `packages/ats/contracts/**`. Ensures every contract element (contract/interface/library, enums, structs, events, custom errors, state variables, modifiers, functions) carries audit-ready NatSpec in the project's house style (British English, ≤100-char lines, intent-focused). Also use on explicit request (`/solidity-natspec`) to document or re-document an existing `.sol` file.
---

# Solidity NatSpec Documentation

Produce audit-ready NatSpec on every element the edit touches. Document **intent, behaviour,
constraints, and structure** — never restate what the code already says. Audience: auditors,
maintainers, analysis tools.

When editing an existing file, document new or modified elements only. On `/solidity-natspec [path]`,
do a full pass on the file.

## Templates

Place each block immediately above the element. Declaration order inside a contract:
enums → structs → events → custom errors → state vars → modifiers → functions
(`external`/`public` first, then `internal`/`private`).

For contract / interface / library headers, `@title`, `@author` and `@notice` are **mandatory** —
solhint's `use-natspec` rule flags each missing tag. Use
`@author Asset Tokenization Studio Team` unless the file is clearly a fork of upstream code
(OpenZeppelin, ERC references).

```solidity
/**
 * @title <name>
 * @author Asset Tokenization Studio Team
 * @notice <high-level purpose>
 * @dev <design notes, patterns, assumptions, invariants>
 */
```

For every other element, include `@notice` (what and why), `@dev` when non-obvious, and one
`@param`/`@return` per named parameter/return with matching names. Functions, events, and errors
that omit `@notice` or mismatch `@param`/`@return` names fail solhint.

For interface implementations, use `@inheritdoc IFoo` on the concrete function (plus a `@dev` only
if the implementation introduces behaviour the interface doesn't describe — e.g. a pause gate, a
facet-specific guard, a snapshot side-effect). Don't duplicate the interface block; it drifts.

## Style

- **British English**: _decentralised_, _behaviour_, _initialised_, _optimise_, _authorised_,
  _organisation_, _serialise_, _analyse_, _licence_ (noun). Never American spelling.
- **≤100 chars per line** in comment bodies.
- **Present tense** for descriptions ("Transfers tokens…", not "Will transfer…").
- **Precise smart-contract terminology**: reentrancy, invariant, storage slot, delegatecall,
  selector, EIP-xxx, diamond facet.

## What to cover when relevant

Access control (roles, modifiers) · state mutations · invariants · gas hazards (unbounded loops,
cold SLOADs, storage packing) · initialisation / upgrade order · events emitted · errors raised
· side effects (external calls, transfers, mint/burn) · cross-contract interactions · pre/post
conditions · reentrancy posture.

## What to avoid

Explaining Solidity itself ("this is a mapping…"). Narrating self-explanatory code ("getter that
returns the value"). Inventing behaviour not in the code — read the implementation first.
Referencing the current task/PR/commit — NatSpec lives with the code. Duplicating interface
NatSpec on the implementation.

## Validate before finishing

For each touched file:

1. **Coverage script** (heuristic, enforces the tags solhint's `use-natspec` rule flags):

   ```bash
   node .claude/skills/solidity-natspec/scripts/check_natspec.mjs <path/to/file.sol>
   ```

   Contract/interface/library need `@title` + `@author` + `@notice`. Functions/events/errors need
   `@notice` and one `@param`/`@return` per named parameter/return with matching names. Elements
   carrying `@inheritdoc X` pass without further tag checks. State variables are intentionally
   not scanned — verify those by eye against "what to cover". Exit 0 means the required tags
   exist; content quality still needs review.

2. **Solhint** on the touched file(s):

   ```bash
   cd packages/ats/contracts && npx solhint <relative/path/to/file.sol>
   ```

   Any `use-natspec` warning must be resolved before reporting done. `ordering`, `gas-*`,
   `no-unused-import` warnings are outside this skill's scope — flag them to the user instead of
   silently editing.

Insert the NatSpec directly with Edit/Write. Only emit a separate report if the user asks for a
review-only pass.
