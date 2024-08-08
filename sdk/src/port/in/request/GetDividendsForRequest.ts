import { MIN_ID } from '../../../domain/context/security/CorporateAction.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class GetDividendsForRequest extends ValidatedRequest<GetDividendsForRequest> {
  securityId: string;
  targetId: string;
  dividendId: number;

  constructor({
    securityId,
    targetId,
    dividendId,
  }: {
    securityId: string;
    targetId: string;
    dividendId: number;
  }) {
    super({
      securityId: Validation.checkHederaIdFormatOrEvmAddress(),
      targetId: Validation.checkHederaIdFormatOrEvmAddress(),
      dividendId: Validation.checkNumber({
        max: undefined,
        min: MIN_ID,
      }),
    });
    this.securityId = securityId;
    this.targetId = targetId;
    this.dividendId = dividendId;
  }
}
