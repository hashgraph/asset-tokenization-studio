// SPDX-License-Identifier: Apache-2.0

import { SecurityDate } from "@domain/context/shared/SecurityDate";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";

export default class ProtectedTransferFromByPartitionRequest extends ValidatedRequest<ProtectedTransferFromByPartitionRequest> {
  securityId: string;
  partitionId: string;
  sourceId: string;
  targetId: string;
  amount: string;
  deadline: string;
  nonce: number;
  signature: string;

  constructor({
    securityId,
    partitionId,
    sourceId,
    targetId,
    amount,
    deadline,
    nonce,
    signature,
  }: {
    securityId: string;
    partitionId: string;
    sourceId: string;
    targetId: string;
    amount: string;
    deadline: string;
    nonce: number;
    signature: string;
  }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      partitionId: FormatValidation.checkBytes32Format(),
      sourceId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      targetId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      amount: FormatValidation.checkAmount(),
      deadline: (val) => {
        return SecurityDate.checkDateTimestamp(parseInt(val), Math.ceil(new Date().getTime() / 1000), undefined);
      },
    });

    this.securityId = securityId;
    this.sourceId = sourceId;
    this.targetId = targetId;
    this.amount = amount;
    this.partitionId = partitionId;
    this.deadline = deadline;
    this.nonce = nonce;
    this.signature = signature;
  }
}
