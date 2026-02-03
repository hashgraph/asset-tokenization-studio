// SPDX-License-Identifier: Apache-2.0

export class ScheduledBalanceAdjustment {
  executionTimeStamp: number;
  factor: number;
  decimals: number;
  constructor(executionTimeStamp: number, factor: number, decimals: number) {
    this.executionTimeStamp = executionTimeStamp;
    this.factor = factor;
    this.decimals = decimals;
  }
}
