// SPDX-License-Identifier: Apache-2.0

export class ScheduledBalanceAdjustment {
  executionTimeStamp: number;
  factor: number;
  decimals: number;
  isDisabled: boolean;
  constructor(executionTimeStamp: number, factor: number, decimals: number, isDisabled: boolean = false) {
    this.executionTimeStamp = executionTimeStamp;
    this.factor = factor;
    this.decimals = decimals;
    this.isDisabled = isDisabled;
  }
}
