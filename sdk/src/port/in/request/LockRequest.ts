import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class LockRequest extends ValidatedRequest<LockRequest> {
  securityId: string;
  targetId: string;
  amount: string;
  expirationTimestamp: string;

  constructor({
    targetId,
    amount,
    securityId,
    expirationTimestamp,
  }: {
    targetId: string;
    amount: string;
    securityId: string;
    expirationTimestamp: string;
  }) {
    super({
      securityId: Validation.checkHederaIdFormatOrEvmAddress(),
      targetId: Validation.checkHederaIdFormatOrEvmAddress(),
      amount: Validation.checkAmount(),
    });

    this.securityId = securityId;
    this.targetId = targetId;
    this.amount = amount;
    this.expirationTimestamp = expirationTimestamp;
  }
}
