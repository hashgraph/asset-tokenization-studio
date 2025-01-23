import { BigNumber } from 'ethers';

export class TransferAndLock {
  public from: string;
  public to: string;
  public amount: BigNumber;
  public data: string;
  public expirationTimestamp: BigNumber;
}
