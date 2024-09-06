import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';
import { SecurityDate } from '../../../domain/context/shared/SecurityDate.js';

export default class SetDividendsRequest extends ValidatedRequest<SetDividendsRequest> {
  securityId: string;
  amountPerUnitOfSecurity: string;
  recordTimestamp: string;
  executionTimestamp: string;

  constructor({
    securityId,
    amountPerUnitOfSecurity,
    recordTimestamp,
    executionTimestamp,
  }: {
    securityId: string;
    amountPerUnitOfSecurity: string;
    recordTimestamp: string;
    executionTimestamp: string;
  }) {
    super({
      amountPerUnitOfSecurity: Validation.checkAmount(),
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
    this.amountPerUnitOfSecurity = amountPerUnitOfSecurity;
    this.recordTimestamp = recordTimestamp;
    this.executionTimestamp = executionTimestamp;
  }
}
