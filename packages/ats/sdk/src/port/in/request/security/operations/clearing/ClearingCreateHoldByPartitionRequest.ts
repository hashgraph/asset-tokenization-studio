// SPDX-License-Identifier: Apache-2.0

import { SecurityDate } from "@domain/context/shared/SecurityDate";
import ValidatedRequest from "@core/validation/ValidatedArgs";

import FormatValidation from "@port/in/request/FormatValidation";

export default class ClearingCreateHoldByPartitionRequest extends ValidatedRequest<ClearingCreateHoldByPartitionRequest> {
  securityId: string;
  partitionId: string;
  amount: string;
  escrowId: string;
  targetId: string;
  clearingExpirationDate: string;
  holdExpirationDate: string;

  constructor({
    securityId,
    partitionId,
    amount,
    escrowId,
    targetId,
    clearingExpirationDate,
    holdExpirationDate,
  }: {
    securityId: string;
    partitionId: string;
    amount: string;
    escrowId: string;
    targetId: string;
    clearingExpirationDate: string;
    holdExpirationDate: string;
  }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      partitionId: FormatValidation.checkBytes32Format(),
      amount: FormatValidation.checkAmount(),
      escrowId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
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
    this.targetId = targetId;
    this.clearingExpirationDate = clearingExpirationDate;
    this.holdExpirationDate = holdExpirationDate;
  }
}
