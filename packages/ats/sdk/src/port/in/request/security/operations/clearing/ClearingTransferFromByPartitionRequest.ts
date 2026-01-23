// SPDX-License-Identifier: Apache-2.0

import { SecurityDate } from "@domain/context/shared/SecurityDate";
import ValidatedRequest from "@core/validation/ValidatedArgs";

import FormatValidation from "@port/in/request/FormatValidation";

export default class ClearingTransferFromByPartitionRequest extends ValidatedRequest<ClearingTransferFromByPartitionRequest> {
  securityId: string;
  partitionId: string;
  amount: string;
  sourceId: string;
  targetId: string;
  expirationDate: string;

  constructor({
    securityId,
    partitionId,
    amount,
    sourceId,
    targetId,
    expirationDate,
  }: {
    securityId: string;
    partitionId: string;
    amount: string;
    sourceId: string;
    targetId: string;
    expirationDate: string;
  }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      partitionId: FormatValidation.checkBytes32Format(),
      amount: FormatValidation.checkAmount(),
      sourceId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      targetId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      expirationDate: (val) => {
        return SecurityDate.checkDateTimestamp(parseInt(val), Math.ceil(new Date().getTime() / 1000));
      },
    });

    this.securityId = securityId;
    this.partitionId = partitionId;
    this.amount = amount;
    this.sourceId = sourceId;
    this.targetId = targetId;
    this.expirationDate = expirationDate;
  }
}
