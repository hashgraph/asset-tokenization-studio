import BaseError, { ErrorCode } from '../../../../core/error/BaseError.js';

export default class InvalidAutoRenewPeriod extends BaseError {
  constructor(val: number | string, min: number, max?: number) {
    super(
      ErrorCode.InvalidRange,
      `Invalid Auto Renew Period ${val}, outside range ${
        max !== undefined ? `[${min}, ${max}]` : min
      }`,
    );
  }
}
