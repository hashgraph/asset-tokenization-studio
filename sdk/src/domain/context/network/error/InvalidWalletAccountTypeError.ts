import BaseError, { ErrorCode } from '../../../../core/error/BaseError.js';

export class InvalidWalletTypeError extends BaseError {
  constructor() {
    super(ErrorCode.OperationNotAllowed, `Wallet is not allowed.`);
    Object.setPrototypeOf(this, InvalidWalletTypeError.prototype);
  }
}
