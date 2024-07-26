import BaseError, { ErrorCode } from '../../../../core/error/BaseError.js';

export class InvalidType extends BaseError {
  constructor(val: unknown) {
    super(
      ErrorCode.InvalidType,
      `Value ${val} is not valid. Please enter a numerical value.`,
    );
  }
}
