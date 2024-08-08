import BaseError, { ErrorCode } from '../../../../core/error/BaseError.js';

export class InvalidRegulationType extends BaseError {
  constructor(value: number) {
    super(
      ErrorCode.InvalidRegulationType,
      `Regulation Type ${value} is not valid`,
    );
  }
}
