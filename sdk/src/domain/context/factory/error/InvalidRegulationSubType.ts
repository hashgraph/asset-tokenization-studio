import BaseError, { ErrorCode } from '../../../../core/error/BaseError.js';

export class InvalidRegulationSubType extends BaseError {
  constructor(value: number) {
    super(
      ErrorCode.InvalidRegulationSubType,
      `Regulation Sub Type ${value} is not valid`,
    );
  }
}

export class InvalidRegulationSubTypeForType extends BaseError {
  constructor(value: number, type: number) {
    super(
      ErrorCode.InvalidRegulationSubTypeForType,
      `Regulation Sub Type ${value} is not valid for regulation type ${type}`,
    );
  }
}
