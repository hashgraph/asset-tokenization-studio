import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class RedeemRequest extends ValidatedRequest<RedeemRequest> {
  securityId: string;
  amount: string;

  constructor({ amount, securityId }: { amount: string; securityId: string }) {
    super({
      securityId: Validation.checkHederaIdFormatOrEvmAddress(),
      amount: Validation.checkAmount(),
    });

    this.securityId = securityId;
    this.amount = amount;
  }
}
