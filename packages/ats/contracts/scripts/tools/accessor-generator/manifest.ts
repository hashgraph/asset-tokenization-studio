// SPDX-License-Identifier: Apache-2.0

/**
 * Accessor manifest — the single declarative source of truth for the EVM native
 * value accessors emitted into `EvmAccessors.sol`.
 *
 * This module is data only: each entry describes one native EVM value. The
 * generator derives every getter, override reader, override writer and storage
 * field name from these entries. To add an accessor, append one entry here — no
 * generator change is required.
 *
 * @module tools/accessor-generator/manifest
 */

/**
 * Declarative description of a single EVM native-value accessor.
 *
 * Every listed accessor is test-overridable: in test mode the generator emits an
 * override storage field, a reader and a writer, and the getter falls back to the
 * native value on the sentinel. Production reads always route through the accessor
 * (never raw `msg.sender` / `block.timestamp`), so an accessor that is neither read
 * by production nor overridable in tests is simply not listed (e.g. `tx.origin`,
 * zero call sites, was removed — re-add a one-line entry if a consumer needs it).
 */
export interface AccessorDefinition {
  /** Public getter name in camelCase, e.g. `getBlockTimestamp`. */
  name: string;
  /** Native EVM expression the production getter returns, e.g. `block.timestamp`. */
  nativeExpression: string;
  /** Solidity value type of the accessor, e.g. `uint256` or `address`. */
  solidityType: string;
  /** Value meaning "not overridden" in test mode, e.g. `0` or `address(0)`. */
  sentinel: string;
}

/** Every EVM accessor. Append one entry to introduce a new accessor. */
export const ACCESSORS: AccessorDefinition[] = [
  { name: "getBlockTimestamp", nativeExpression: "block.timestamp", solidityType: "uint256", sentinel: "0" },
  { name: "getBlockNumber", nativeExpression: "block.number", solidityType: "uint256", sentinel: "0" },
  { name: "getMsgSender", nativeExpression: "msg.sender", solidityType: "address", sentinel: "address(0)" },
  { name: "getChainId", nativeExpression: "block.chainid", solidityType: "uint256", sentinel: "0" },
];
