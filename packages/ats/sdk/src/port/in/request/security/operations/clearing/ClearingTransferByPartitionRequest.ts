// SPDX-License-Identifier: Apache-2.0

import { SecurityDate } from "@domain/context/shared/SecurityDate";
import ValidatedRequest from "@core/validation/ValidatedArgs";

import FormatValidation from "@port/in/request/FormatValidation";

export default class ClearingTransferByPartitionRequest extends ValidatedRequest<ClearingTransferByPartitionRequest> {
  securityId: string;
  partitionId: string;
  amount: string;
  targetId: string;
  expirationDate: string;

  constructor({
    securityId,
    partitionId,
    amount,
    targetId,
    expirationDate,
  }: {
    securityId: string;
    partitionId: string;
    amount: string;
    targetId: string;
    expirationDate: string;
  }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      partitionId: FormatValidation.checkBytes32Format(),
      amount: FormatValidation.checkAmount(),
      targetId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      expirationDate: (val) => {
        return SecurityDate.checkDateTimestamp(parseInt(val), Math.ceil(new Date().getTime() / 1000));
      },
    });

    this.securityId = securityId;
    this.partitionId = partitionId;
    this.amount = amount;
    this.targetId = targetId;
    this.expirationDate = expirationDate;
  }
}
