import BaseError, { ErrorCode } from '../../../../core/error/BaseError.js';

export class InvalidBytes32 extends BaseError {
  constructor(value: string) {
    super(ErrorCode.InvalidBytes32, `Bytes32 ${value} is not valid`);
  }
}
