import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class ForceTransferRequest extends ValidatedRequest<ForceTransferRequest> {
  securityId: string;
  sourceId: string;
  targetId: string;
  amount: string;

  constructor({
    sourceId,
    targetId,
    amount,
    securityId,
  }: {
    sourceId: string;
    targetId: string;
    amount: string;
    securityId: string;
  }) {
    super({
      securityId: Validation.checkHederaIdFormatOrEvmAddress(),
      sourceId: Validation.checkHederaIdFormatOrEvmAddress(),
      targetId: Validation.checkHederaIdFormatOrEvmAddress(),
      amount: Validation.checkAmount(),
    });

    this.securityId = securityId;
    this.sourceId = sourceId;
    this.targetId = targetId;
    this.amount = amount;
  }
}
