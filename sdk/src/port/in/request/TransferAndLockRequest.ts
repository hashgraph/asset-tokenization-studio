import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class TransferAndLockRequest extends ValidatedRequest<TransferAndLockRequest> {
  securityId: string;
  targetId: string;
  amount: string;
  expirationDate: string;

  constructor({
    targetId,
    amount,
    securityId,
    expirationDate,
  }: {
    targetId: string;
    amount: string;
    securityId: string;
    expirationDate: string;
  }) {
    super({
      securityId: Validation.checkHederaIdFormatOrEvmAddress(),
      targetId: Validation.checkHederaIdFormatOrEvmAddress(),
      amount: Validation.checkAmount(),
    });

    this.securityId = securityId;
    this.targetId = targetId;
    this.amount = amount;
    this.expirationDate = expirationDate;
  }
}
