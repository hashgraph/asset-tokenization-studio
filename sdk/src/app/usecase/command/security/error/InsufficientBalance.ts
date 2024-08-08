import BaseError, { ErrorCode } from '../../../../../core/error/BaseError.js';

export class InsufficientBalance extends BaseError {
  constructor() {
    super(
      ErrorCode.InsufficientBalance,
      `The account's balance is not sufficient to perform the operation`,
    );
  }
}
