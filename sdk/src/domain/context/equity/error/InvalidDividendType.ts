import BaseError, { ErrorCode } from '../../../../core/error/BaseError.js';

export class InvalidDividendType extends BaseError {
  constructor(value: number) {
    super(ErrorCode.InvalidDividendType, `Dividend Type ${value} is not valid`);
  }
}
