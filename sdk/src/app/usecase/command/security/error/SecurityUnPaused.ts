import BaseError, { ErrorCode } from '../../../../../core/error/BaseError.js';

export class SecurityUnPaused extends BaseError {
  constructor() {
    super(ErrorCode.SecurityUnPaused, `The security is currently unpaused`);
  }
}
