import BaseError, { ErrorCode } from '../../../../core/error/BaseError.js';

export class InvalidBytes extends BaseError {
  constructor(value: string) {
    super(ErrorCode.InvalidBytes, `Bytes ${value} is not valid`);
  }
}
