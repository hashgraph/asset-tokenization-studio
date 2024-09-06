import BaseError, { ErrorCode } from '../../../../core/error/BaseError.js';

export class InvalidEvmAddress extends BaseError {
  constructor(value: string) {
    super(ErrorCode.InvalidEvmAddress, `EVM Address ${value} is not valid`);
  }
}
