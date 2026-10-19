---
id: hash-codegen
title: Hash Code Generation
sidebar_label: Hash code generation
---

# Hash Code Generation

Many `bytes32` constants in the contracts — **resolver keys**, **role identifiers**, **storage
locations** — are deterministic `keccak256` hashes of a canonical string. Hand-writing and
hand-maintaining those hex values is error-prone, so ATS **generates and validates** them from
annotations in the source. This page explains the workflow; you'll meet it whenever you add a facet,
a role, or a storage wrapper.

## The idea

Instead of writing the hash yourself, you annotate the constant and let the toolchain fill in the
canonical value. For a resolver key (from `facets/cap/ICap.sol`):

```solidity
/// @custom:hash resolverKey Cap
bytes32 constant RESOLVER_KEY_CAP = 0x88a28e7c45a3ce8d4ca60cd480c98e1b46feb84caec725cb0a6cf96b2c5143b5;
```

The `@custom:hash <kind> <arg>` annotation declares "this constant must equal the canonical hash for
`<kind>`/`<arg>`". The generator computes the hash and writes it into the constant; the checker
verifies the committed hex still matches. Related namespaced hashes follow the same pattern, e.g.
roles are `keccak256("asset.tokenization.standard.role.<PascalName>")` and storage wrappers anchor at
`erc7201:security.token.standard.storage.<PascalName>` (see
[Repository structure → Storage](./repository-structure.md#storage-erc-7201-one-namespace-per-feature)).

## Commands

```bash
# From packages/ats/contracts/

# Write the canonical hashes into the annotated constants
npm run hashes:generate

# Verify the committed hashes are up to date (no writes) — used in CI
npm run hashes:check

# Check hash stability (values don't drift unexpectedly between runs)
npm run hashes:stability
```

`hashes:generate` also runs automatically via the **post-compile hook**, so `npx hardhat compile`
(and therefore `npm run ats:contracts:build`) keeps the hashes in sync. The contract
[registry generator](./adding-a-facet.md) reads these constants, so the order is always:
**annotate → generate hashes → regenerate registry**.

## What the generator validates

The generator is also a linter — it fails loudly rather than emitting a wrong value. It checks, among
other things:

- **Uniqueness** — no two constants claim the same `(kind, arg)` hash, and no constant identifier is
  duplicated.
- **Identifier symmetry** — the constant's name and its annotation argument agree (so
  `RESOLVER_KEY_CAP` is annotated `resolverKey Cap`, not something else).
- **Drift** — a committed hex that no longer matches its canonical value is reported; `--check` fails
  CI, `--write` fixes it.
- **Syntax** — malformed or stacked annotations are rejected.

These rules are why a facet whose interface is missing its `@custom:hash resolverKey` annotation, or
whose constant value drifted, fails registration in the BLR with `BusinessLogicKeyMismatch` — the
generated value and the on-chain value must agree.

## When you'll run it

- **Adding a facet** — your new `RESOLVER_KEY_<NAME>` is filled in by the generator. See
  [Adding a facet](./adding-a-facet.md).
- **Adding a role** — annotate the new role constant in `constants/roles.sol` and regenerate.
- **CI** — `hashes:check` runs on every change to guarantee committed hashes are canonical.

## Related pages

- [Repository structure](./repository-structure.md) — where resolver keys, roles, and storage live.
- [Adding a facet](./adding-a-facet.md) — the most common reason to regenerate.
- [Core concepts → Resolver keys](./core-concepts.md#resolver-keys)
