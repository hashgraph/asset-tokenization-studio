import BigDecimal from '../shared/BigDecimal.js';

export class Dividend {
  amountPerUnitOfSecurity: BigDecimal;
  recordTimeStamp: number;
  executionTimeStamp: number;
  snapshotId?: number;

  constructor(
    amountPerUnitOfSecurity: BigDecimal,
    recordTimeStamp: number,
    executionTimeStamp: number,
    snapshotId?: number,
  ) {
    this.amountPerUnitOfSecurity = amountPerUnitOfSecurity;
    this.recordTimeStamp = recordTimeStamp;
    this.executionTimeStamp = executionTimeStamp;
    this.snapshotId = snapshotId ? snapshotId : undefined;
  }
}
