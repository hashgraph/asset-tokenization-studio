import { BigNumber } from 'ethers';
import BigDecimal from '../shared/BigDecimal.js';

export class Lock {
  constructor(
    public readonly id: number,
    public readonly amount: BigDecimal,
    public readonly expiredTimestamp: BigNumber,
  ) {}
}
