// SPDX-License-Identifier: Apache-2.0

import { BigNumber } from "ethers";

export class ScheduledSnapshot {
  constructor(
    public readonly scheduledTimestamp: BigNumber,
    public readonly data: string,
  ) {}
}
