import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class TransferRequest extends ValidatedRequest<TransferRequest> {
  securityId: string;
  targetId: string;
  amount: string;

  constructor({
    targetId,
    amount,
    securityId,
  }: {
    targetId: string;
    amount: string;
    securityId: string;
  }) {
    super({
      securityId: Validation.checkHederaIdFormatOrEvmAddress(),
      targetId: Validation.checkHederaIdFormatOrEvmAddress(),
      amount: Validation.checkAmount(),
    });

    this.securityId = securityId;
    this.targetId = targetId;
    this.amount = amount;
  }
}
