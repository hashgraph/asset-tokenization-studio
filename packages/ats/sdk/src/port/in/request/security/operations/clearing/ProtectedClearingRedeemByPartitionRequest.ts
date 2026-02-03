// SPDX-License-Identifier: Apache-2.0

import { SecurityDate } from "@domain/context/shared/SecurityDate";
import ValidatedRequest from "@core/validation/ValidatedArgs";

import FormatValidation from "@port/in/request/FormatValidation";

export default class ProtectedClearingRedeemByPartitionRequest extends ValidatedRequest<ProtectedClearingRedeemByPartitionRequest> {
  securityId: string;
  partitionId: string;
  amount: string;
  sourceId: string;
  expirationDate: string;
  deadline: string;
  nonce: number;
  signature: string;

  constructor({
    securityId,
    partitionId,
    amount,
    sourceId,
    expirationDate,
    deadline,
    nonce,
    signature,
  }: {
    securityId: string;
    partitionId: string;
    amount: string;
    sourceId: string;
    expirationDate: string;
    deadline: string;
    nonce: number;
    signature: string;
  }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      partitionId: FormatValidation.checkBytes32Format(),
      amount: FormatValidation.checkAmount(),
      sourceId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
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
    this.sourceId = sourceId;
    this.expirationDate = expirationDate;
    this.deadline = deadline;
    this.nonce = nonce;
    this.signature = signature;
  }
}
