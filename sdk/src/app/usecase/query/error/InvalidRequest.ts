import BaseError, { ErrorCode } from '../../../../core/error/BaseError.js';

export class InvalidRequest extends BaseError {
  constructor(val: string) {
    super(ErrorCode.InvalidRequest, val);
  }
}
