import BigDecimal from '../shared/BigDecimal.js';

export class Coupon {
  recordTimeStamp: number;
  executionTimeStamp: number;
  rate: BigDecimal;
  snapshotId?: number;

  constructor(
    recordTimeStamp: number,
    executionTimeStamp: number,
    rate: BigDecimal,
    snapshotId?: number,
  ) {
    this.recordTimeStamp = recordTimeStamp;
    this.executionTimeStamp = executionTimeStamp;
    this.rate = rate;
    this.snapshotId = snapshotId ? snapshotId : undefined;
  }
}
