import BaseError, { ErrorCode } from '../../../../../core/error/BaseError.js';

export class MaxSupplyReached extends BaseError {
  constructor() {
    super(ErrorCode.MaxSupplyReached, `max supply reached`);
  }
}
