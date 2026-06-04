---
name: facets-interfaces-doctor
description: Quickly check whether FACETS_INTERFACES.md will generate correctly. Use before regenerating or reviewing packages/ats/contracts/FACETS_INTERFACES.md, or when a developer asks "will the facet interfaces doc be correct?", "did I break the facet docs?", or wants to validate the assumptions the generator relies on (interface naming, resolver keys, role declarations, name shadowing, referenced types). Runs the generator's built-in `--check` doctor and explains the findings. Also use on explicit request (`/facets-interfaces-doctor`).
---

# Facet Interfaces Doctor

`packages/ats/contracts/gen_facets_interfaces.mjs` generates `FACETS_INTERFACES.md` by reading the
Solidity compiler ASTs and joining to the generated registry. It depends on a set of conventions
(documented at the top of that script) that, if broken, can **silently** drop or corrupt content. This
skill runs the generator's own `--check` doctor — which reuses the exact same ASTs and indexes as
generation, so a clean check means a clean document — and interprets the result.

## Run it

From `packages/ats/contracts`:

```bash
npx hardhat compile        # only if the contracts changed since the last compile
node gen_facets_interfaces.mjs --check
```

`--check` reports problems and exits non-zero on errors; it never writes the document.

- **Compile first if needed.** The doctor reads `artifacts/build-info` and the generated registry. If
  it aborts with _"No Hardhat build-info"_ or _"build-info is stale"_, run `npx hardhat compile` (or
  `npm run compile`) and re-run. Staleness means a `.sol` was edited since the last compile.
- Exit code **0** = no errors (warnings may still be listed); **1** = at least one error.

## Reading the output

Findings are grouped and prefixed:

- **✗ error** — content that _should_ appear will be dropped or replaced. Fix before regenerating.
- **⚠ warning** — advisory: a real but order-dependent or often-benign risk. Review, but it may be
  expected (e.g. types intentionally imported from npm packages).

### Errors (fix these)

| Finding                                             | Meaning                                                                                                                                                                    | Fix                                          |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `Interfaces — off-convention filename, DROPPED`     | A facet interface (declares an `interface` + a `RESOLVER_KEY_*`) lives in a file whose name doesn't start with `I` + upper-case/digit, so the generator skips it entirely. | Rename the file to `I<PascalName>.sol`.      |
| `Roles — <NAME> declared inside a contract, MISSED` | A `ROLE_*` / `DEFAULT_ADMIN_ROLE` `bytes32 constant` is declared inside a contract/library, not at file scope, so it never reaches the Roles table.                        | Move the constant to file scope (top level). |

### Warnings (review)

| Finding                                                       | Meaning                                                                                                                                                  | Typical resolution                                                                        |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `Resolver key — N keys; using <X>`                            | The interface file declares several `RESOLVER_KEY_*`; the **first** is used for the registry join.                                                       | Confirm the first is the intended key, or split the interfaces into separate files.       |
| `Resolver key — <X> not in registry`                          | The facet's key has no matching registry entry, so it lists no events/errors.                                                                            | Expected for parent/protocol interfaces; otherwise regenerate the registry / fix the key. |
| `Types — type(s) not inlined (external/npm?)`                 | A referenced struct/enum is declared outside `contracts/` (or is a typo), so its definition isn't shown.                                                 | Usually expected for npm-package types; fix only if it should be a local type.            |
| `Type shadowing — N differing definitions (last wins)`        | A struct/enum name has different bodies in different files; the doc shows whichever file is processed last.                                              | Rename to disambiguate, or confirm the surviving definition is the right one.             |
| `Event/error shadowing — N differing signatures (first wins)` | An event/error name has different signatures across files (often a test mock shadowing a real interface); the rendered signature is the first one found. | Rename the mock's declaration, or accept the order-dependence.                            |
| `Roles — <NAME> has a non-literal value`                      | A role is computed (e.g. `keccak256(...)`), so its value column renders blank.                                                                           | Cosmetic; ignore or pin to a literal.                                                     |
| `Output — unrecognised layer_N`                               | A facet sits in a `layer_*` folder other than `layer_1/2/3`; it's ranked as a core facet and may sort oddly.                                             | Add the layer to the generator's ordering if intended.                                    |

## After a clean check

If the doctor reports no errors and you want the document refreshed, regenerate it:

```bash
node gen_facets_interfaces.mjs
```

(The full list of conditions the generator relies on is documented in the header comment of
`gen_facets_interfaces.mjs` — the doctor checks the ones that fail silently. The loud preconditions —
missing/stale build-info, missing `FACET_REGISTRY` — abort generation on their own.)
