import BaseError, { ErrorCode } from '../../../../../core/error/BaseError.js';

export class DecimalsOverRange extends BaseError {
  constructor(val: number) {
    super(
      ErrorCode.InvalidRange,
      `The amount has more decimals than the limit (${val})`,
    );
  }
}
