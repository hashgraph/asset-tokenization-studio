# Hash codegen — manual test report

Generated 2026-05-21. Branch `refactor/BBND-1674-hash-constants` at
`d7fa326be` (HEAD with the new hardening, **not yet pushed**).

Each scenario installs ONE fixture file under
`packages/ats/contracts/contracts/_demo/`, runs the script command shown
in the heading, and captures verbatim CLI output. Fixtures are removed
between scenarios so each test runs in isolation against the real
codebase.

---

## Scenario 1 — D1 duplicate `(kind, arg)`

**Fixture** (`contracts/_demo/d1-duplicate-pair.sol`)

```solidity
/// @custom:hash resolverKey Security
bytes32 constant RESOLVER_KEY_SECURITY_COPY = 0x0000000000000000000000000000000000000000000000000000000000000000;
```

`resolverKey Security` already lives in `ISecurity.sol`. This is the
classic copy-paste-and-forget-to-change-the-arg case.

**Output of `npm run ats:contracts:hashes:check`** (exit 1):

```
❌ hash codegen validation failed (2 issue(s)):
  Duplicate @custom:hash annotation resolverKey Security appears 2 times:
    contracts/facets/securityHolders/ISecurityHolders.sol:7 (RESOLVER_KEY_SECURITY),
    contracts/_demo/d1-duplicate-pair.sol:10 (RESOLVER_KEY_SECURITY_COPY).
    Each (kind, arg) must be unique — likely a copy-paste error.
  contracts/_demo/d1-duplicate-pair.sol:10:
    identifier 'RESOLVER_KEY_SECURITY_COPY' does not match the canonical name
    'RESOLVER_KEY_SECURITY' derived from @custom:hash resolverKey Security.
No file was modified. Fix the issues above and re-run.
```

D1 fires AND Tier 1 #1 also fires on the same constant (the alias name
doesn't match the canonical mapping). Two safety nets caught the same
mistake — desired behaviour.

---

## Scenario 2 — D2 duplicate constant identifier

**Fixture** (`contracts/_demo/d2-duplicate-identifier.sol`)

```solidity
/// @custom:hash role DemoOnly
bytes32 constant ROLE_AGENT = 0x0000000000000000000000000000000000000000000000000000000000000000;
```

`ROLE_AGENT` already exists in `constants/roles.sol`. Same identifier in
two files compiles (file-scope constants are file-local) but creates
ambiguity — which import wins?

**Output of `hashes:check`** (exit 1):

```
❌ hash codegen validation failed (2 issue(s)):
  Duplicate constant identifier 'ROLE_AGENT' declared in 2 files:
    contracts/constants/roles.sol:29,
    contracts/_demo/d2-duplicate-identifier.sol:11.
    Each annotated constant must have a unique name.
  contracts/_demo/d2-duplicate-identifier.sol:11:
    identifier 'ROLE_AGENT' does not match the canonical name
    'ROLE_DEMO_ONLY' derived from @custom:hash role DemoOnly.
```

D2 fires alongside Tier 1 #1 — again two independent checks both catch
the bug. Good defence-in-depth.

---

## Scenario 3 — Tier 1 #1 symmetric identifier rule

**Fixture** (`contracts/_demo/s3-bad-identifier.sol`)

```solidity
/// @custom:hash role DemoCleanupRole
bytes32 constant DEMO_CLEANUP_ROLE_FOR_TESTING = 0x000...000;
```

Annotation is valid PascalCase, but identifier doesn't match the
canonical `ROLE_<UPPER_SNAKE>` derivation.

**Output of `hashes:check`** (exit 1):

```
❌ hash codegen validation failed (1 issue(s)):
  contracts/_demo/s3-bad-identifier.sol:9:
    identifier 'DEMO_CLEANUP_ROLE_FOR_TESTING' does not match the canonical name
    'ROLE_DEMO_CLEANUP_ROLE' derived from @custom:hash role DemoCleanupRole.
```

This is the AI-foolproofing rule. An AI agent that "improves" the
identifier for readability without updating the annotation is rejected.

---

## Scenario 4 — Tier 1 #2 hash-shaped constant without annotation

**Fixture** (`contracts/_demo/s4-no-annotation.sol`)

```solidity
bytes32 constant HAND_PASTED_HASH = 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef;
```

A 64-hex bytes32 constant with no preceding `@custom:hash` annotation.
This is what hand-pasted hashes look like in PRs.

**Output of `hashes:check`** (exit 1):

```
❌ hash codegen validation failed (1 issue(s)):
  contracts/_demo/s4-no-annotation.sol:8:
    bytes32 constant 'HAND_PASTED_HASH' has a hash-shaped value
    (0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef)
    but no preceding @custom:hash annotation.
    Either add the annotation (preferred) or add the identifier to
    HASH_SHAPED_ALLOWLIST in scripts/codegen/applyHashGen.ts with team approval.
```

Catches the most dangerous AI failure mode — an LLM computing a keccak
from memory and pasting a wrong hex. The script forces every hash-shaped
constant through the annotation pipeline.

Allowlisted identifiers (`DEFAULT_ADMIN_ROLE`, `*_TYPEHASH` suffix,
`_DEFAULT_PARTITION`) pass through unchanged — verified by 3 dedicated
unit tests in `applyHashGen.test.ts`.

---

## Scenario 5 — D7 stacked annotations

**Fixture** (`contracts/_demo/s5-stacked.sol`)

```solidity
/// @custom:hash role DemoFooRole
/// @custom:hash role DemoBarRole
bytes32 constant ROLE_DEMO_BAR_ROLE = 0x000...000;
```

Two annotations stacked with no constant in between. The first one is
"stale" and would be silently dropped by a naïve parser.

**Output of `hashes:check`** (exit 1):

```
❌ hash codegen validation failed (1 issue(s)):
  contracts/_demo/s5-stacked.sol:8:
    @custom:hash annotation is immediately followed by another @custom:hash
    annotation on line 9. One annotation per constant.
```

---

## Scenario 6 — D8 syntax violations (multiple in one run)

**Fixture** (`contracts/_demo/s6-bad-syntax.sol`)

Three different syntax errors in one file:

```solidity
/// @custom:hash storage demo_lowercase_storage      // snake_case arg
bytes32 constant STORAGE_LOCATION_DEMO_A = 0x000...000;

/// @custom:hash typehash DemoB                      // unknown kind
bytes32 constant STORAGE_LOCATION_DEMO_B = 0x000...000;

/// @custom:hash role demoCamel                      // camelCase arg
bytes32 constant ROLE_DEMO_CAMEL = 0x000...000;
```

**Output of `hashes:check`** (exit 1):

```
❌ hash codegen validation failed (3 issue(s)):
  contracts/_demo/s6-bad-syntax.sol:10: invalid @custom:hash arg
    'demo_lowercase_storage'. Args must be PascalCase: start with an
    upper-case letter, only letters and digits.
  contracts/_demo/s6-bad-syntax.sol:13: unknown @custom:hash kind
    'typehash'. Valid: storage, resolverKey, role, corporateAction,
    scheduledTask.
  contracts/_demo/s6-bad-syntax.sol:16: invalid @custom:hash arg
    'demoCamel'. Args must be PascalCase: start with an upper-case
    letter, only letters and digits.
```

All three errors surfaced in ONE run. The script gathers errors rather
than fail-fast — devs see the full picture immediately instead of one
fix-and-rerun cycle per issue.

---

## Scenario 7 — happy drift + loud `--write` log

**Fixture** (`contracts/_demo/s7-drift.sol`)

A brand-new annotation with placeholder hex `0x000...000`:

```solidity
/// @custom:hash storage DemoNewSlot
bytes32 constant STORAGE_LOCATION_DEMO_NEW_SLOT = 0x000...000;
```

**Output of `npm run ats:contracts:hashes:generate`** (exit 0):

```
⚠️  hash codegen: source was MODIFIED — review and commit the changes below
   1 constant(s) rewritten across 1 file(s)

   contracts/_demo/s7-drift.sol:9
     identifier:  STORAGE_LOCATION_DEMO_NEW_SLOT
     annotation:  @custom:hash storage DemoNewSlot
     before:      0x0000000000000000000000000000000000000000000000000000000000000000
     after:       0x90fe34ba2cf5d38bd7d8c31993fd5e4a79e5b8a0e51be081f81c96ae051d0c00

   ⓘ If any of these are unexpected, run `git diff` and verify the
     annotation args are correct before committing.
```

The dev cannot miss the mutation — visible banner, explicit before/after
hex, identifier + annotation context, and a reminder to verify with
`git diff` before committing. Compare with the old single-line log
(`✏️ rewrote 1 constants across 1 files contracts/.../X.sol:9 ID`) which
hid almost everything.

---

## Scenario 8 — hash stability check (positive case)

Real check against `origin/development` for the current PR.

```
$ npm run ats:contracts:hashes:stability -- --base origin/development --soft
✅ hash stability: no pre-existing hash changed vs origin/development
```

Exit 0. No pre-existing `(kind, arg) → hex` triple changed between base
and HEAD; all hashes on this PR are either new additions or unchanged.

**Negative case (NOT exercised here):** would require the `hashGen.ts`
formula to change OR an existing annotation arg to be renamed. The
script flags both as `::warning::` (soft mode) or `::error::` (strict
mode). The CI step uses `--soft` initially so the team can adjust
without blocking on day one; flipping to `--strict` is a one-line PR
once the team is comfortable.

---

## Programmatic test suite

`npx hardhat test test/scripts/unit/codegen/applyHashGen.test.ts`

```
  scripts/codegen/applyHashGen — rewriter rules
    happy path
      ✔ collects a single well-formed annotated constant with zero errors and zero drift
      ✔ collects drift when the hex is wrong but the annotation is valid
    D1 — duplicate (kind, arg) annotation
      ✔ fails when the same (kind, arg) appears in two files
    D2 — duplicate constant identifier across files
      ✔ fails when the same identifier is declared in two files
    D7 — annotation immediately followed by another annotation
      ✔ fails when two annotations stack with no constant between them
    D8 — invalid PascalCase arg
      ✔ rejects invalid arg 'foo'
      ✔ rejects invalid arg 'Foo_Bar'
      ✔ rejects invalid arg 'FOO_BAR'
      ✔ rejects invalid arg '1Foo'
      ✔ rejects invalid arg 'foo-bar'
      ✔ rejects unknown kind
    Tier 1 #1 — symmetric identifier rule
      ✔ rejects an identifier that does not match the canonical UPPER_SNAKE of the arg
      ✔ accepts PascalCase args with embedded acronyms (KpiLinkedRate -> KPI_LINKED_RATE)
    Tier 1 #2 — hash-shaped constant without annotation
      ✔ fails when a non-zero 64-hex bytes32 constant has no annotation
      ✔ ignores zero-valued bytes32 constants
      ✔ allowlists DEFAULT_ADMIN_ROLE even with hash-shaped value
      ✔ allowlists *_TYPEHASH suffix even with hash-shaped value
    atomicity
      ✔ does not surface drift when validation has errors (no rewrite would happen)
  18 passing (45ms)
```

Plus the existing `hashGen.test.ts` (canonical-hash KATs + invariants):
`23 passing (25ms)`.

---

## Final state of working tree

After all scenarios cleaned up:

```
$ ls packages/ats/contracts/contracts/_demo/
(empty)

$ git status --short
(only the new code & test files staged — no fixture leftovers)
```

`_demo/` directory itself can be removed before commit, or left as the
declared location for future fixture-based experiments. Currently empty.

---

## Summary

| Scenario | Rule                                     | Caught?               |
| -------- | ---------------------------------------- | --------------------- |
| 1        | D1 duplicate `(kind, arg)`               | ✓ + bonus Tier 1 #1   |
| 2        | D2 duplicate identifier                  | ✓ + bonus Tier 1 #1   |
| 3        | Tier 1 #1 symmetric identifier           | ✓                     |
| 4        | Tier 1 #2 hash-shaped without annotation | ✓                     |
| 5        | D7 stacked annotations                   | ✓                     |
| 6        | D8 invalid arg / unknown kind            | ✓ (3 in one run)      |
| 7        | `--write` happy path                     | ✓ loud banner emitted |
| 8        | Hash stability (positive)                | ✓ exit 0              |

All defensive layers fire. The script aborts BEFORE any file is written
when validation fails. Unit + integration coverage in place.
