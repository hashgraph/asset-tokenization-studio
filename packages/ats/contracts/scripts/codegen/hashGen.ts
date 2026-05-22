// SPDX-License-Identifier: Apache-2.0
//
// Canonical hash-generation helpers for ATS Solidity constants.
//
// Single source of truth for every hash literal precomputed at codegen time
// (storage locations, resolver keys, roles, corporate-action types, scheduled
// task types). EIP-712 typehashes are foldable `keccak256("typedef")` literals
// and do NOT go through this module.
//
// Naming order rule: generic → specific. Family fragment first, then the
// specific PascalCase name. The keccak input is always
// `asset.tokenization.standard.<family>.<PascalName>` (no leading underscore).

import { keccak256, AbiCoder, toUtf8Bytes } from "ethers";

export const ATS = "asset.tokenization.standard.";

const STORAGE = "storage.";
const RESOLVER_KEY = "resolverKey.";
const ROLE = "role.";
const CORPORATE_ACTION = "corporateAction.";
const SCHEDULED_TASK = "scheduledTask.";

const k = (s: string): string => keccak256(toUtf8Bytes(s));

// ERC-7201 slot derivation:
//   keccak256(abi.encode(uint256(keccak256(id)) - 1)) & ~bytes32(uint256(0xff))
const erc7201 = (id: string): string => {
  const inner = BigInt(k(id)) - 1n;
  const enc = AbiCoder.defaultAbiCoder().encode(["uint256"], [inner]);
  const mask = (1n << 256n) - 1n - 0xffn;
  return "0x" + (BigInt(k(enc)) & mask).toString(16).padStart(64, "0");
};

export type HashKind = "storage" | "resolverKey" | "role" | "corporateAction" | "scheduledTask";

export const HASHES: Readonly<Record<HashKind, (name: string) => string>> = {
  storage: (name) => erc7201(ATS + STORAGE + name),
  resolverKey: (facet) => k(ATS + RESOLVER_KEY + facet),
  role: (name) => k(ATS + ROLE + name),
  corporateAction: (name) => k(ATS + CORPORATE_ACTION + name),
  scheduledTask: (name) => k(ATS + SCHEDULED_TASK + name),
} as const;

export const HASH_KINDS: readonly HashKind[] = Object.keys(HASHES) as HashKind[];

export const isHashKind = (s: string): s is HashKind => (HASH_KINDS as readonly string[]).includes(s);

// Identifier-derivation rule. Every @custom:hash annotation maps to ONE
// canonical Solidity identifier; the rewriter enforces it so an AI/dev cannot
// rename the constant for cosmetic reasons and silently break the inverse
// lookup. Mapping:
//
//   storage          Foo            -> STORAGE_LOCATION_FOO
//   resolverKey      BondFixedRate  -> RESOLVER_KEY_BOND_FIXED_RATE
//   role             CorporateAction -> ROLE_CORPORATE_ACTION
//   corporateAction  Dividend       -> CORPORATE_ACTION_TYPE_DIVIDEND
//   scheduledTask    Snapshot       -> SCHEDULED_TASK_TYPE_SNAPSHOT
//
// The `_TYPE_` infix on corporateAction / scheduledTask makes the dispatch-tag
// nature explicit and avoids collision with `ROLE_CORPORATE_ACTION` etc.
const IDENTIFIER_PREFIX: Readonly<Record<HashKind, string>> = {
  storage: "STORAGE_LOCATION_",
  resolverKey: "RESOLVER_KEY_",
  role: "ROLE_",
  corporateAction: "CORPORATE_ACTION_TYPE_",
  scheduledTask: "SCHEDULED_TASK_TYPE_",
} as const;

/**
 * Convert a PascalCase argument (e.g. `BondFixedRate`) to its canonical
 * UPPER_SNAKE form (`BOND_FIXED_RATE`).
 *
 * Rules:
 *   - Insert `_` before each upper-case letter that follows a lower-case or digit
 *   - Insert `_` between a sequence of uppers and a following lower (`KPILinked` -> `KPI_Linked`)
 *   - Then upper-case the result
 *
 * Examples:
 *   Foo            -> FOO
 *   BondManager    -> BOND_MANAGER
 *   KpiLinkedRate  -> KPI_LINKED_RATE
 *   ERC1410        -> ERC1410          (acronyms with digits are preserved)
 */
export function pascalToUpperSnake(arg: string): string {
  return arg
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
    .toUpperCase();
}

/** Compute the canonical Solidity identifier for a `(kind, arg)` annotation. */
export function canonicalIdentifier(kind: HashKind, arg: string): string {
  return IDENTIFIER_PREFIX[kind] + pascalToUpperSnake(arg);
}

/**
 * Argument-syntax check. Annotation args MUST be PascalCase: start with an
 * upper-case letter, contain only letters and digits, no underscores. Anything
 * else (camelCase, snake_case, trailing punctuation, etc.) is rejected to keep
 * the canonical-identifier mapping reversible.
 */
export function isValidPascalArg(arg: string): boolean {
  return /^[A-Z][A-Za-z0-9]*$/.test(arg);
}

/**
 * Reverse mapping: take an UPPER_SNAKE identifier and produce the canonical
 * PascalCase form (`KPI_LINKED_RATE` -> `KpiLinkedRate`). Digits attach to the
 * preceding chunk (`ERC1410` round-trips via `ERC_1410` -> `Erc1410`).
 */
function upperSnakeToCanonicalPascal(snake: string): string {
  return snake
    .toLowerCase()
    .split("_")
    .filter((s) => s.length > 0)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
}

/**
 * Canonical-arg check. The forward transform `pascalToUpperSnake` is many-to-
 * one (e.g. `Kyc` and `KYC` both produce `KYC`; `KpiLinkedRate` and
 * `KPILinkedRate` both produce `KPI_LINKED_RATE`). Each ambiguous form would
 * produce a DIFFERENT keccak input and therefore a different on-chain hash,
 * so we must reject all but the canonical round-trip form.
 *
 * The canonical form is the one where every word-chunk has exactly its first
 * letter upper-case and the rest lower-case. `Kyc` is canonical; `KYC` is
 * not. `BondManager` is canonical; `BONDManager` is not. `Erc1410` is the
 * canonical form for `ERC_1410`-shaped identifiers; raw `ERC1410` is NOT
 * canonical and would silently collide with `Erc1410`.
 *
 * @returns true iff `arg === upperSnakeToCanonicalPascal(pascalToUpperSnake(arg))`
 */
export function isCanonicalPascalArg(arg: string): boolean {
  if (!isValidPascalArg(arg)) return false;
  return upperSnakeToCanonicalPascal(pascalToUpperSnake(arg)) === arg;
}

/** Compute the canonical PascalCase form for a given annotation arg. */
export function canonicalPascalArg(arg: string): string {
  return upperSnakeToCanonicalPascal(pascalToUpperSnake(arg));
}
