// SPDX-License-Identifier: Apache-2.0

import { AddressLike, Contract, ContractTransactionReceipt, EventLog, Signer, ethers } from "ethers";

/**
 * ABI for the file-level errors declared in
 * `contracts/interfaces/errors/ICommonErrors.sol`. These errors are not part of any
 * Solidity interface, so TypeChain doesn't generate a typed factory for them.
 * Tests use {@link getCommonErrors} to obtain a `Contract` handle whose ABI exposes
 * these errors so chai matchers like `revertedWithCustomError` can resolve them.
 *
 * Keep in sync with `contracts/interfaces/errors/ICommonErrors.sol`.
 */
export const COMMON_ERRORS_ABI = [
  "error WrongExpirationTimestamp()",
  "error ZeroAddressNotAllowed()",
  "error WrongSignature()",
  "error ExpiredDeadline(uint256 deadline)",
  "error WrongSignatureLength()",
  "error WrongNonce(uint256 nonce, address account)",
  "error AlreadyInitialized()",
] as const;

/**
 * Build a `Contract` handle that exposes the file-level errors from
 * `ICommonErrors.sol` in its ABI. The address is arbitrary — the contract
 * isn't called, only its `interface` is used by chai's `revertedWithCustomError`
 * to look up the error name and compute its selector.
 *
 * @example
 *   const commonErrors = getCommonErrors(diamond.target);
 *   await expect(facet.connect(signer).doIt(...))
 *     .to.be.revertedWithCustomError(commonErrors, "WrongSignature");
 */
export function getCommonErrors(addr: AddressLike, signer?: Signer): Contract {
  return new Contract(addr as string, COMMON_ERRORS_ABI as readonly string[], signer);
}

/**
 * Compute the 4-byte selector (or bytes32-padded) for one of the file-level
 * common errors by signature string. Use this when a test needs the raw selector
 * (e.g. asserting against `canTransfer`'s returned reason code) and the error is
 * declared in `ICommonErrors.sol` rather than in any contract's interface.
 *
 * @example
 *   getCommonErrorSelector("ZeroAddressNotAllowed()") // "0x8579befe"
 */
export function getCommonErrorSelector(errorSignature: string, asBytes4: boolean = false): string {
  const sigHash = ethers.id(errorSignature).slice(0, 10);
  if (asBytes4) return sigHash;
  return sigHash.padEnd(66, "0");
}

export const ERROR_SELECTOR_MAP: Record<string, string> = {
  "0x649815a5": "TokenIsPaused",
  "0x72058d69": "TokenIsUnpaused",
  "0x796c1f0d": "AccountIsBlocked",
  "0x8579befe": "ZeroAddressNotAllowed",
  "0x0fc23480": "WrongDates",
  "0x362f9ddc": "InvalidPartition",
  "0x0b53f5c6": "AbafChangeForBlockForbidden",
  "0x039be1dd": "WrongLockId",
  "0x76d08f88": "NotAllowedInMultiPartitionMode",
  "0xf4b7b072": "TokenIsNotControllable",
  "0x5b2e3086": "ClearingIsActivated",
  "0x82f109aa": "WrongExpirationTimestamp",
  "0xdcf61246": "WrongTimestamp",
  "0xd3cd2144": "ExpirationDateReached",
  "0x6afa0b9d": "HoldExpirationNotReached",
  "0x0915bbbb": "HoldExpirationReached",
  "0x8e81eb83": "SnapshotIdDoesNotExists",
  "0xf6deaa04": "InsufficientBalance",
};

export const KNOWN_ERRORS: Record<string, string> = {
  TokenIsPaused: "0x649815a5",
  TokenIsUnpaused: "0x72058d69",
  AccountIsBlocked: "0x796c1f0d",
  ZeroAddressNotAllowed: "0x8579befe",
  WrongDates: "0x0fc23480",
  InvalidPartition: "0x362f9ddc",
  AbafChangeForBlockForbidden: "0x0b53f5c6",
  WrongLockId: "0x039be1dd",
  NotAllowedInMultiPartitionMode: "0x76d08f88",
  TokenIsNotControllable: "0xf4b7b072",
  ClearingIsActivated: "0x5b2e3086",
  WrongExpirationTimestamp: "0x82f109aa",
  WrongTimestamp: "0xdcf61246",
  ExpirationDateReached: "0xd3cd2144",
  HoldExpirationNotReached: "0x6afa0b9d",
  HoldExpirationReached: "0x0915bbbb",
  SnapshotIdDoesNotExists: "0x8e81eb83",
  InsufficientBalance: "0xf6deaa04",
};

export function extractErrorSelector(revertData: string | Uint8Array): string {
  if (typeof revertData === "string") {
    const hex = revertData.startsWith("0x") ? revertData.slice(2) : revertData;
    return "0x" + hex.slice(0, 8);
  }
  const hex = Buffer.from(revertData).toString("hex");
  return "0x" + hex.slice(0, 8);
}

export function getErrorNameFromRevertData(revertData: string | Uint8Array): string {
  const selector = extractErrorSelector(revertData);
  return ERROR_SELECTOR_MAP[selector] || "Unknown";
}

export function assertCustomError(
  receipt: ContractTransactionReceipt | null,
  contract: Contract,
  errorName: string,
): void {
  if (!receipt) {
    throw new Error("Receipt is null");
  }

  if (!receipt.logs || receipt.logs.length === 0) {
    throw new Error("No logs found in receipt");
  }

  const errorFragment = contract.interface.getError(errorName);

  const revertError = receipt.logs.find((log) => {
    try {
      return (log as EventLog).fragment && (log as EventLog).fragment?.name === "Error";
    } catch {
      return false;
    }
  });

  if (!revertError) {
    throw new Error(`Expected custom error "${errorName}" but no error was found`);
  }

  if (errorFragment) {
    try {
      const decoded = contract.interface.parseLog({ topics: revertError.topics, data: revertError.data });
      if (decoded && decoded.name === errorName) {
        return;
      }
    } catch {
      // Fall through
    }
  }

  const expectedSelector = KNOWN_ERRORS[errorName];
  if (expectedSelector) {
    const actualSelector = extractErrorSelector(revertError.data);
    if (actualSelector === expectedSelector) {
      return;
    }
    throw new Error(
      `Expected error "${errorName}" (selector: ${expectedSelector}) but got selector: ${actualSelector}`,
    );
  }

  throw new Error(`Error "${errorName}" not found in contract interface and no known selector mapping`);
}
