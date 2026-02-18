// SPDX-License-Identifier: Apache-2.0

/**
 * Utility for generating Solidity function selectors from contract interfaces.
 *
 * Used primarily for facet registration in the Diamond pattern, where function
 * selectors identify which functions belong to which facets.
 *
 * @module infrastructure/utils/selector
 */

import { Interface } from "ethers";

/**
 * Get the function selector (4-byte signature hash) for a contract function.
 *
 * Generates either a 4-byte selector (0x12345678) or a bytes32-padded selector
 * (0x1234567800000000...0000) depending on the asBytes4 parameter.
 *
 * @param contractFactory - Contract factory with TypeChain-generated interface
 * @param selector - Function name to get selector for
 * @param asBytes4 - If true, returns 4-byte selector; if false, returns bytes32-padded selector
 * @returns Function selector as hex string
 * @throws Error if function name not found in contract interface
 *
 * @example
 * ```typescript
 * import { ERC1410Facet__factory } from '@contract-types'
 *
 * // Get 4-byte selector for transfer function
 * const selector4 = getSelector(ERC1410Facet__factory, 'transfer', true)
 * // Returns: '0xa9059cbb'
 *
 * // Get bytes32-padded selector for facet registration
 * const selector32 = getSelector(ERC1410Facet__factory, 'transfer', false)
 * // Returns: '0xa9059cbb00000000000000000000000000000000000000000000000000000000'
 * ```
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
