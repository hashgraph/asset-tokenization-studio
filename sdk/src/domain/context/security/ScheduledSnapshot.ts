import { BigNumber } from 'ethers';

export class ScheduledSnapshot {
  constructor(
    public readonly scheduledTimestamp: BigNumber,
    public readonly data: string,
  ) {}
}
