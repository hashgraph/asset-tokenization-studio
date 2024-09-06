import BaseError, { ErrorCode } from '../../../../core/error/BaseError.js';

export class InvalidBytes3 extends BaseError {
  constructor(value: string) {
    super(ErrorCode.InvalidBytes3, `Bytes3 ${value} is not valid`);
  }
}
