import BaseError, { ErrorCode } from '../../../../core/error/BaseError.js';

export default class InvalidTimestampRange extends BaseError {
  constructor(val: Date, min: Date, max?: Date) {
    super(
      ErrorCode.InvalidRange,
      `Invalid Timestamp ${val}, outside range ${
        max !== undefined ? `[${min}, ${max}]` : min
      }`,
    );
  }
}
