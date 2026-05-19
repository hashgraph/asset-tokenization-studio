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
