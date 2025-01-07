import { SecurityDate } from '../../../domain/context/shared/SecurityDate.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class ProtectedTransferAndLockRequest extends ValidatedRequest<ProtectedTransferAndLockRequest> {
  securityId: string;
  sourceId: string;
  targetId: string;
  amount: string;
  expirationDate: string;
  deadline: string;
  nounce: number;
  signature: string;

  constructor({
    securityId,
    amount,
    sourceId,
    targetId,
    expirationDate,
    deadline,
    nounce,
    signature,
  }: {
    securityId: string;
    amount: string;
    sourceId: string;
    targetId: string;
    expirationDate: string;
    deadline: string;
    nounce: number;
    signature: string;
  }) {
    super({
      securityId: Validation.checkHederaIdFormatOrEvmAddress(),
      targetId: Validation.checkHederaIdFormatOrEvmAddress(),
      sourceId: Validation.checkHederaIdFormatOrEvmAddress(),
      amount: Validation.checkAmount(),
      deadline: (val) => {
        return SecurityDate.checkDateTimestamp(
          parseInt(val),
          Math.ceil(new Date().getTime() / 1000),
          undefined,
        );
      },
    });

    this.securityId = securityId;
    this.amount = amount;
    this.sourceId = sourceId;
    this.targetId = targetId;
    this.expirationDate = expirationDate;
    this.deadline = deadline;
    this.nounce = nounce;
    this.signature = signature;
  }
}
