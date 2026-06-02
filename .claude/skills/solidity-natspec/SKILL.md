---
name: solidity-natspec
description: Produce and validate comprehensive NatSpec documentation on Solidity files. Use whenever a `.sol` file is created or modified — contracts, interfaces, libraries, facets under `packages/ats/contracts/**`. Ensures every contract element (contract/interface/library, enums, structs, events, custom errors, state variables, modifiers, functions) carries audit-ready NatSpec in the project's house style (British English, ≤100-char lines, intent-focused). Also use on explicit request (`/solidity-natspec`) to document or re-document an existing `.sol` file. Also use whenever a facet interface under `packages/ats/contracts/contracts/facets/**` changes, or when asked to update, regenerate, or refresh `packages/ats/contracts/FACETS_METHODS.md` (the generated facet method index) — the skill regenerates it by running `packages/ats/contracts/gen_facets_methods.mjs`, never by hand-editing.
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

## Storage structs (ERC-7201)

`@custom:storage-location erc7201:<namespace>` is a NatSpec **custom tag**, not a free-floating
comment. Place it **inside** the struct's NatSpec block as the last tag — never as a `///` line
above the block. Solc's NatSpec parser, `forge inspect storage-layout`, Slither, and the
OpenZeppelin upgrades plugin all read the tag from the doc-comment block regardless of
placement; keeping it inside the block keeps the annotation visually adjacent to the struct
identifier and the whole doc unit contiguous.

```solidity
/**
 * @notice Persistent storage layout for ERC-20 metadata and balances.
 * @dev Holds the initialisation flag, decimals, total supply, balances, and allowances.
 *      New fields must be appended below the marker to preserve ERC-7201 slot offsets.
 * @custom:storage-location erc7201:security.token.standard.storage.Erc20
 */
struct ERC20Storage { ... }
```

When a single struct backs multiple ERC-7201 namespaces (e.g. `ScheduledTasksDataStorage`,
`ExternalListDataStorage`), list every binding in a `@dev` block — no single
`@custom:storage-location` line captures the multi-binding.

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

## FACETS_METHODS.md (facet method index)

`packages/ats/contracts/FACETS_METHODS.md` is a generated reference listing every external entry
point of the ATS facets, so a developer integrating with the contracts has the full call surface
in one place. **Keep it in sync** whenever a facet interface changes: any time you add, remove,
rename, or change the signature of a function (or a struct/enum it references) on an `I*.sol`
interface under `packages/ats/contracts/contracts/facets/**` (including the `layer_1` / `layer_2`
/ `layer_3` subfolders), regenerate the document in the same change.

Regenerate it deterministically — do **not** hand-edit FACETS_METHODS.md:

```bash
cd packages/ats/contracts
node gen_facets_methods.mjs
```

The generator (`packages/ats/contracts/gen_facets_methods.mjs`) parses the interface ASTs via
`@solidity-parser/parser` and produces the document with these rules — useful to know when
verifying its output or extending the script:

- **One section per facet interface.** Covers every `I<PascalName>.sol` under `contracts/facets/**`
  that declares at least one function. Skips pure type interfaces (`*Types.sol`, or any interface
  with no functions) and concrete contracts (`Identity.sol`, `*Facet.sol`) — type definitions
  surface in the **Types** block of the facets that use them.
- **Facet name.** Heading is derived from the interface name minus the leading `I`, split into
  words (`IAccessControl` → "Access Control"); the on-chain `resolverKey` is shown verbatim as a
  field (it is inconsistently cased in source, so it is not used for the heading). Colliding
  headings are disambiguated with the interface stem.
- **Methods.** Every function as its full Solidity signature — name, input parameters (type +
  storage location + name, in order), and the `returns (...)` clause. `view` / `pure` mutability is
  kept; declaration order is preserved; long signatures wrap one parameter per line. **No prose.**
- **Types.** Referenced `struct`/`enum` definitions are reproduced verbatim (dedented) in a
  per-facet **Types** block, resolved transitively (a struct field's custom type is pulled in too),
  with a `// declared in <path>` note.
- Facets are ordered to mirror the layer layout (top-level, then `layer_1`, `layer_2`, `layer_3`).

If a facet interface legitimately needs to fall outside these rules, adjust the generator rather
than the output.

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
