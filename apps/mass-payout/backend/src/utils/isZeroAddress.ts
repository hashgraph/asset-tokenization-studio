// SPDX-License-Identifier: Apache-2.0

import { ZeroAddress } from "ethers"

export function isZeroAddress(address: string): boolean {
  return ZeroAddress === address
}
