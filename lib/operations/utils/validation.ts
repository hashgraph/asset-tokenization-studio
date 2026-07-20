// SPDX-License-Identifier: Apache-2.0

/** Input validation helpers. They throw with a labelled message on invalid input. */

import { ethers } from "ethers";

/** Validate an Ethereum address; `fieldName` labels the error message. */
export function validateAddress(address: string, fieldName: string = "address"): void {
  if (!address) {
    throw new Error(`${fieldName} is required`);
  }
  if (!ethers.isAddress(address)) {
    throw new Error(`Invalid ${fieldName}: ${address}`);
  }
}

/** Validate a bytes32 value ('0x' + 64 hex chars); `fieldName` labels the error message. */
export function validateBytes32(value: string, fieldName: string = "bytes32 value"): void {
  if (!value) {
    throw new Error(`${fieldName} is required`);
  }
  if (!/^0x[0-9a-fA-F]{64}$/.test(value)) {
    throw new Error(`Invalid ${fieldName}: must be 66 characters (0x + 64 hex chars)`);
  }
}
