// SPDX-License-Identifier: Apache-2.0

/**
 * Utility for generating Solidity function selectors from contract interfaces.
 *
 * Used primarily for facet registration in the Diamond pattern, where function
 * selectors identify which functions belong to which facets.
 */

import { Interface } from "ethers";

/**
 * Get the selector for a contract function or error. Returns a 4-byte selector
 * (`0x12345678`) when `asBytes4` is true, otherwise a bytes32-padded selector
 * (`0x12345678000...0`). Throws if the name is not in the interface.
 */
export function getSelector(
  contractFactory: { interface: Interface },
  selector: string,
  asBytes4: boolean = false,
): string {
  const iface = contractFactory.interface;
  const func = iface.getFunction(selector);
  if (func) {
    const sigHash = func.selector;
    if (asBytes4) return sigHash;
    return sigHash.padEnd(66, "0");
  }

  const error = iface.getError(selector);
  if (error) {
    const sigHash = error.selector;
    if (asBytes4) return sigHash;
    return sigHash.padEnd(66, "0");
  }

  throw new Error(`Selector "${selector}" is not implemented`);
}
