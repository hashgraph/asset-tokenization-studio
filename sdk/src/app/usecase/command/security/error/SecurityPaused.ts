import BaseError, { ErrorCode } from '../../../../../core/error/BaseError.js';

export class SecurityPaused extends BaseError {
  constructor() {
    super(ErrorCode.SecurityPaused, `The security is currently paused`);
  }
}
