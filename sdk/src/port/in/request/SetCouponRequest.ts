import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';
import { SecurityDate } from '../../../domain/context/shared/SecurityDate.js';

export default class SetCouponRequest extends ValidatedRequest<SetCouponRequest> {
  securityId: string;
  rate: string;
  recordTimestamp: string;
  executionTimestamp: string;

  constructor({
    securityId,
    rate,
    recordTimestamp,
    executionTimestamp,
  }: {
    securityId: string;
    rate: string;
    recordTimestamp: string;
    executionTimestamp: string;
  }) {
    super({
      rate: Validation.checkAmount(),
      recordTimestamp: (val) => {
        return SecurityDate.checkDateTimestamp(
          parseInt(val),
          Math.ceil(new Date().getTime() / 1000),
          parseInt(this.executionTimestamp),
        );
      },
      executionTimestamp: (val) => {
        return SecurityDate.checkDateTimestamp(
          parseInt(val),
          parseInt(this.recordTimestamp),
          undefined,
        );
      },
      securityId: Validation.checkHederaIdFormatOrEvmAddress(),
    });

    this.securityId = securityId;
    this.rate = rate;
    this.recordTimestamp = recordTimestamp;
    this.executionTimestamp = executionTimestamp;
  }
}
