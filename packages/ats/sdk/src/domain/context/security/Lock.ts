// SPDX-License-Identifier: Apache-2.0

import { BigNumber } from "ethers";
import BigDecimal from "../shared/BigDecimal";

export class Lock {
  constructor(
    public readonly id: number,
    public readonly amount: BigDecimal,
    public readonly expiredTimestamp: BigNumber,
  ) {}
}
