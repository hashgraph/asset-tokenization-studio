import { MIN_ID } from '../../../domain/context/security/CorporateAction.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class GetDividendsRequest extends ValidatedRequest<GetDividendsRequest> {
  securityId: string;
  dividendId: number;

  constructor({
    securityId,
    dividendId,
  }: {
    securityId: string;
    dividendId: number;
  }) {
    super({
      securityId: Validation.checkHederaIdFormatOrEvmAddress(),
      dividendId: Validation.checkNumber({
        max: undefined,
        min: MIN_ID,
      }),
    });
    this.securityId = securityId;
    this.dividendId = dividendId;
  }
}
