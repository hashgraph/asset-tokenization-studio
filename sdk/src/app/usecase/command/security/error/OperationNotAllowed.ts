import BaseError, { ErrorCode } from '../../../../../core/error/BaseError.js';

export class OperationNotAllowed extends BaseError {
  constructor(val: string) {
    super(ErrorCode.OperationNotAllowed, val);
  }
}
