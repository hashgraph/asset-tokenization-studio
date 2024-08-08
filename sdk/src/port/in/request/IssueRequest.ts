import { BaseRequest } from './BaseRequest.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class IssueRequest
  extends ValidatedRequest<IssueRequest>
  implements BaseRequest
{
  securityId: string;
  targetId: string;
  amount: string;

  constructor({
    amount,
    targetId,
    securityId,
  }: {
    amount: string;
    targetId: string;
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
