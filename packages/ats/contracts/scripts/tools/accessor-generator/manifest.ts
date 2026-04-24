// SPDX-License-Identifier: Apache-2.0

/**
 * Accessor Manifest — Single Source of Truth
 * Define all EVM native value accessors (block.timestamp, msg.sender, etc.)
 * with their types and zero sentinels. The generator derives all storage
 * slots and function names from this manifest.
 */

export interface AccessorDef {
  /** Public function name (camelCase) */
  name: string;
  /** Native EVM expression to inline in prod mode */
  native: string;
  /** Solidity type (uint256, address, etc.) */
  type: string;
  /** Zero sentinel: the value that means "not overridden" */
  sentinel: string;
}

/** All EVM accessors. Add a new accessor by appending one line to this array. */
export const ACCESSORS: AccessorDef[] = [
  {
    name: "getBlockTimestamp",
    native: "block.timestamp",
    type: "uint256",
    sentinel: "0",
  },
  {
    name: "getBlockNumber",
    native: "block.number",
    type: "uint256",
    sentinel: "0",
  },
  {
    name: "getMsgSender",
    native: "msg.sender",
    type: "address",
    sentinel: "address(0)",
  },
  {
    name: "getTxOrigin",
    native: "tx.origin",
    type: "address",
    sentinel: "address(0)",
  },
  {
    name: "getChainId",
    native: "block.chainid",
    type: "uint256",
    sentinel: "0",
  },
];

/** Derive the override reader function name from the accessor name. */
export function overrideReaderName(accessorName: string): string {
  return `${accessorName}Override`;
}

/** Derive the writer function name from the accessor name. */
export function writerName(accessorName: string): string {
  // getBlockTimestamp → setBlockTimestampOverride (remove "get" prefix, add "set" and "Override")
  const withoutGet = accessorName.startsWith("get") ? accessorName.slice(3) : accessorName;
  return `set${withoutGet}Override`;
}

/** Derive the storage slot label from the accessor name. */
export function slotLabel(accessorName: string): string {
  return `ats.test.accessor.${accessorName}`;
}
