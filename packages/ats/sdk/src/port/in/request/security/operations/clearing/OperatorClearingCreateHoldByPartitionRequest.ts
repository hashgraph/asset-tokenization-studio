// SPDX-License-Identifier: Apache-2.0

import { SecurityDate } from "@domain/context/shared/SecurityDate";
import ValidatedRequest from "@core/validation/ValidatedArgs";

import FormatValidation from "@port/in/request/FormatValidation";

export default class OperatorClearingCreateHoldByPartitionRequest extends ValidatedRequest<OperatorClearingCreateHoldByPartitionRequest> {
  securityId: string;
  partitionId: string;
  amount: string;
  escrowId: string;
  sourceId: string;
  targetId: string;
  clearingExpirationDate: string;
  holdExpirationDate: string;

  constructor({
    securityId,
    partitionId,
    amount,
    escrowId,
    sourceId,
    targetId,
    clearingExpirationDate,
    holdExpirationDate,
  }: {
    securityId: string;
    partitionId: string;
    amount: string;
    escrowId: string;
    sourceId: string;
    targetId: string;
    clearingExpirationDate: string;
    holdExpirationDate: string;
  }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      partitionId: FormatValidation.checkBytes32Format(),
      amount: FormatValidation.checkAmount(),
      escrowId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      sourceId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      targetId: FormatValidation.checkHederaIdFormatOrEvmAddress(true),
      clearingExpirationDate: (val) => {
        return SecurityDate.checkDateTimestamp(parseInt(val), Math.ceil(new Date().getTime() / 1000));
      },
      holdExpirationDate: (val) => {
        return SecurityDate.checkDateTimestamp(parseInt(val), Math.ceil(new Date().getTime() / 1000));
      },
    });

    this.securityId = securityId;
    this.partitionId = partitionId;
    this.amount = amount;
    this.escrowId = escrowId;
    this.sourceId = sourceId;
    this.targetId = targetId;
    this.clearingExpirationDate = clearingExpirationDate;
    this.holdExpirationDate = holdExpirationDate;
  }
}
