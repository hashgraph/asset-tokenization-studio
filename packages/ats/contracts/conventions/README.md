# ATS Solidity Conventions

Single source of truth for the coding conventions of `packages/ats/contracts`. Every rule has a
stable ID (`ATS-<AREA>-<NNN>`) and lives in exactly one topic file. Both humans and LLM tooling
consume these files:

- **Review time** — the `/ats-style-guide` skill loads every `conventions/*.md` file and applies
  all rules to the diff under review.

## Rule format

Each rule follows this canonical structure:

```markdown
### ATS-XXX-NNN — short title
- Severity: ERROR | WARNING
- Enforcement: AUTOMATED (deterministically checkable from the source text) | MANUAL (requires understanding the code)
- Pattern: what to look for.
- Rationale: why the rule exists (optional when self-evident).
- Fix: the exact corrective action.
```

`Severity` is how much the violation weighs: `ERROR` rules must be fixed before merging;
`WARNING` rules are flagged but never block (typically technical debt being phased out, or
judgment calls).

`Enforcement` is how the rule is checked — the same axis the W3C ACT Rules Format uses
(automated / manual): `AUTOMATED` rules are deterministically checkable from the source text,
so they are candidates for `solhint` (today, built-in rules such as `gas-custom-errors` and
`no-global-import`; a dedicated `solhint-plugin-ats` for the ATS-specific ones is planned).
`MANUAL` rules need code comprehension and are reviewed by the `/ats-style-guide` subagent. The
two fields are independent — an `ERROR` can be either `AUTOMATED` or `MANUAL`.

## Rule index

| File                                 | Scope                                          | Rule IDs                                                                                                                  |
| ------------------------------------ | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| [architecture.md](architecture.md)   | Diamond/MAF layers, boundaries, initializers   | ATS-EVM-001/002, ATS-FACET-001, ATS-SUFFIX-001, ATS-SEL-001, ATS-STYLE-002, ATS-BOUND-001, ATS-ARCH-001..004, ATS-INIT-001/002, ATS-EVENT-005 |
| [events.md](events.md)               | Declaration, emit site, promotion, imports     | ATS-EVENT-001..004, ATS-EVENT-006..009                                                                                     |
| [code-quality.md](code-quality.md)   | Errors, imports & types, gas, NatSpec, linting | ATS-ERR-001, ATS-TYPE-001/002, ATS-IMP-001, ATS-GAS-001/002, ATS-FUNC-001, ATS-NATSPEC-001, ATS-LINT-001                   |
| [storage.md](storage.md)             | ERC-7201 structs, layout, accessors            | ATS-STORAGE-001/002, ATS-STYLE-001, ATS-PRIV-001                                                                           |
| [naming.md](naming.md)               | Identifier prefixes/suffixes, artifact types   | ATS-NAME-001..003, ATS-IFACE-001                                                                                           |

## Adding or changing a rule

1. Add the rule to the matching topic file (create a new topic file only when none fits), using
   the canonical format and the next free number in its area.
2. Update the rule index table above.
3. Never reuse a retired rule ID — mark it `(retired)` in the index instead.
4. Nothing else to touch: `CLAUDE.md` and the `/ats-style-guide` skill reference this directory,
   not individual rules. Only update `CLAUDE.md` if the rule is critical enough to belong in its
   inline shortlist.
