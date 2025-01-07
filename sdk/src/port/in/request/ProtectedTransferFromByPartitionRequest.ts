import { SecurityDate } from '../../../domain/context/shared/SecurityDate.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class ProtectedTransferFromByPartitionRequest extends ValidatedRequest<ProtectedTransferFromByPartitionRequest> {
  securityId: string;
  partitionId: string;
  sourceId: string;
  targetId: string;
  amount: string;
  deadline: string;
  nounce: number;
  signature: string;

  constructor({
    securityId,
    partitionId,
    sourceId,
    targetId,
    amount,
    deadline,
    nounce,
    signature,
  }: {
    securityId: string;
    partitionId: string;
    sourceId: string;
    targetId: string;
    amount: string;
    deadline: string;
    nounce: number;
    signature: string;
  }) {
    super({
      securityId: Validation.checkHederaIdFormatOrEvmAddress(),
      partitionId: Validation.checkNumber(),
      sourceId: Validation.checkHederaIdFormatOrEvmAddress(),
      targetId: Validation.checkHederaIdFormatOrEvmAddress(),
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
    this.sourceId = sourceId;
    this.targetId = targetId;
    this.amount = amount;
    this.partitionId = partitionId;
    this.deadline = deadline;
    this.nounce = nounce;
    this.signature = signature;
  }
}
