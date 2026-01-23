// SPDX-License-Identifier: Apache-2.0

import { constants } from "ethers"

export function isZeroAddress(address: string): boolean {
  return constants.AddressZero === address
}
