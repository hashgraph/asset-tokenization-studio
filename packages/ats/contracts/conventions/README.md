# ATS Solidity Conventions

Project-specific coding conventions for `packages/ats/contracts`. Each rule has a stable ID
(`ATS-<AREA>-<NNN>`) and lives in one topic file; the `/ats-style-guide` skill loads every
`*.md` here and applies them to the diff under review. Anything **not** covered by an `ATS-XXX`
rule defaults to the official
[Solidity style guide](https://docs.soliditylang.org/en/latest/style-guide.html).

## Rule format

```markdown
### ATS-XXX-NNN — short title

- Severity: ERROR | WARNING
- Enforcement: AUTOMATED | MANUAL
- Pattern: what to look for.
- Rationale: why it exists (optional when self-evident).
- Fix: the corrective action.
```

- **Severity** — the rule's _target_ severity. `ERROR` must be fixed (enforced at pre-commit via
  `lint-staged` for `AUTOMATED` rules, and surfaced by the `/ats-style-guide` review for `MANUAL`
  ones); `WARNING` is flagged but never blocks. **Ratchet:** an `AUTOMATED`/`ERROR` rule that
  still has preexisting debt in the codebase runs at solhint `warn` (so it surfaces without
  blocking work on legacy files) until the debt is cleared, then flips to `error`. The live
  enforcement level and remaining debt count live in `solhint.config.js`, not here.
- **Enforcement** — `AUTOMATED` is deterministically checkable from source text (solhint-able);
  `MANUAL` needs code comprehension (reviewed by the subagent). The two fields are independent.

A rule already enforced by solhint (a built-in or a `solhint-plugin-ats` rule) carries **only a
pointer to its enforcing rule** — no Pattern/Rationale/Fix. The behaviour, severity and current
debt live in the rule source and `solhint.config.js`; duplicating them here just lets them drift.

## File skeleton

A new topic file follows this shape, so it reads like the existing set (the most structured
example is [events.md](events.md)):

```markdown
# <Topic>

<One or two lines: what this file governs; point to any related rule that lives elsewhere
(e.g. "Initializer events (ATS-EVENT-005) live in architecture.md").>

## <Concern>

### ATS-XXX-NNN — short title

- … (per Rule format above)

## <Another concern>

### ATS-XXX-NNN — short title

- …
```

- Group rules under `##` concern headings — never leave a `###` rule directly beneath the `#`
  title. A retired rule keeps its `###` stub next to the rule it was merged into.
- Optionally close with reference tables (e.g. artifact-type suffixes) or, for a complex topic,
  a "Review methodology" checklist.

## Rule index

| File                               | Scope                                                     | Rule IDs                                                                                                                                      |
| ---------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| [architecture.md](architecture.md) | Diamond/MAF layers, boundaries, initializers              | ATS-EVM-001/002, ATS-FACET-001, ATS-SUFFIX-001, ATS-SEL-001, ATS-STYLE-002, ATS-BOUND-001, ATS-ARCH-001..004, ATS-INIT-001/002, ATS-EVENT-005 |
| [events.md](events.md)             | Declaration, emit site, promotion, imports, indexing      | ATS-EVENT-001..010 (005 in architecture.md)                                                                                                   |
| [code-quality.md](code-quality.md) | Errors, imports & types, gas, NatSpec, linting            | ATS-ERR-001, ATS-TYPE-001/002, ATS-IMP-001, ATS-GAS-001/002, ATS-FUNC-001, ATS-NATSPEC-001, ATS-LINT-001                                      |
| [storage.md](storage.md)           | ERC-7201 structs, layout, accessors                       | ATS-STORAGE-001/002, ATS-STYLE-001, ATS-PRIV-001                                                                                              |
| [naming.md](naming.md)             | Identifier prefixes/suffixes, cardinality, artifact types | ATS-NAME-001..008, ATS-IFACE-001                                                                                                              |

## Where does a rule live?

Files split by **the artifact a rule constrains**. A rule goes in the most specific subject file
that exists — `events.md`, `storage.md`, `architecture.md` each hold _all_ concerns (structure,
naming, style) for their artifact. Concerns with no single artifact fall to the cross-cutting
files: `naming.md` (identifiers) and `code-quality.md` (errors, types, gas, NatSpec, linting).

So event naming (`ATS-EVENT-009`) lives in `events.md`, but parameter naming (`ATS-NAME-001`)
lives in `naming.md` — parameters have no file of their own. A subject earns its own file only
once it gathers several rules. Inside a subject file, group rules under concern headings
(`## Naming`, `## Structure`, …) so the structure-vs-style split stays visible.

## Is this even a rule?

A candidate earns an `ATS-XXX` ID only if it is: **general** (a class of code, not one file),
**adjudicable** (yes/no from the text, not taste), **justified** (you can write the rationale),
**not duplicated** (not already covered by another rule or solhint), and **an invariant, not a
task** (a one-off migration is a ticket).

It _also_ becomes a script gate only when `AUTOMATED` **and** `ERROR` **and** reliably checkable
(regex/AST, no false positives) — via `solhint-plugin-ats` or an interim grep in the skill's
`check-solhint.sh` hook. Most rules stay `MANUAL` and never reach the script. A rule can be split
so its deterministic slice descends to the script while the judgment slice stays manual
(e.g. manual `ATS-NAME-004` + automated `ATS-NAME-005`).

## Adding or changing a rule

1. Add it to the matching file (most specific subject file wins), using the format above and the
   next free number in its area.
2. Update the rule index.
3. Never reuse a retired ID — mark it `(retired)` instead.
4. `CLAUDE.md` and the skill reference this directory, not individual rules — only touch
   `CLAUDE.md` if the rule belongs in its inline shortlist.
