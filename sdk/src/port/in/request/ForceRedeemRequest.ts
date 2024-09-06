import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class ForceRedeemRequest extends ValidatedRequest<ForceRedeemRequest> {
  securityId: string;
  sourceId: string;
  amount: string;

  constructor({
    sourceId,
    amount,
    securityId,
  }: {
    sourceId: string;
    amount: string;
    securityId: string;
  }) {
    super({
      securityId: Validation.checkHederaIdFormatOrEvmAddress(),
      sourceId: Validation.checkHederaIdFormatOrEvmAddress(),
      amount: Validation.checkAmount(),
    });

    this.securityId = securityId;
    this.sourceId = sourceId;
    this.amount = amount;
  }
}
