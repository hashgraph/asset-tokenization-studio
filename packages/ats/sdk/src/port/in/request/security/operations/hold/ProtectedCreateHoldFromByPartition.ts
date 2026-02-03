// SPDX-License-Identifier: Apache-2.0

import { SecurityDate } from "@domain/context/shared/SecurityDate";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";

export default class ProtectedCreateHoldByPartitionRequest extends ValidatedRequest<ProtectedCreateHoldByPartitionRequest> {
  securityId: string;
  partitionId: string;
  amount: string;
  escrowId: string;
  sourceId: string;
  targetId: string;
  expirationDate: string;
  deadline: string;
  nonce: number;
  signature: string;

  constructor({
    securityId,
    partitionId,
    amount,
    escrowId,
    sourceId,
    targetId,
    expirationDate,
    deadline,
    nonce,
    signature,
  }: {
    securityId: string;
    partitionId: string;
    amount: string;
    escrowId: string;
    sourceId: string;
    targetId: string;
    expirationDate: string;
    deadline: string;
    nonce: number;
    signature: string;
  }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      partitionId: FormatValidation.checkBytes32Format(),
      amount: FormatValidation.checkAmount(),
      escrowId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      sourceId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      targetId: FormatValidation.checkHederaIdFormatOrEvmAddress(true),
      nonce: FormatValidation.checkNumber({ min: 0 }),
      expirationDate: (val) => {
        return SecurityDate.checkDateTimestamp(parseInt(val), Math.ceil(new Date().getTime() / 1000));
      },
      deadline: (val) => {
        return SecurityDate.checkDateTimestamp(parseInt(val), Math.ceil(new Date().getTime() / 1000));
      },
    });

    this.securityId = securityId;
    this.partitionId = partitionId;
    this.amount = amount;
    this.escrowId = escrowId;
    this.sourceId = sourceId;
    this.targetId = targetId;
    this.expirationDate = expirationDate;
    this.deadline = deadline;
    this.nonce = nonce;
    this.signature = signature;
  }
}
