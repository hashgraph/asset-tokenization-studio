// SPDX-License-Identifier: Apache-2.0

import { ethers } from "hardhat";
import type { Addressable, Signer } from "ethers";
import type { CoreFacet } from "@contract-types";

/**
 * Returns a CoreFacet instance bound to the diamond address.
 *
 * The Core domain (name, symbol, decimals, getERC20Metadata, setName, setSymbol, version,
 * initializeCore) was extracted from ERC20Facet and ERC3643Management/ReadFacet, so any
 * test that calls those methods through the diamond must route them via CoreFacet.
 */
export async function getCoreFacet(target: string | Addressable, signer?: Signer): Promise<CoreFacet> {
  return ethers.getContractAt("CoreFacet", target, signer);
}
