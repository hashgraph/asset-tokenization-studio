// SPDX-License-Identifier: Apache-2.0

import { SecurityDate } from "@domain/context/shared/SecurityDate";
import ValidatedRequest from "@core/validation/ValidatedArgs";

import FormatValidation from "@port/in/request/FormatValidation";

export default class ControllerCreateHoldByPartitionRequest extends ValidatedRequest<ControllerCreateHoldByPartitionRequest> {
  securityId: string;
  partitionId: string;
  amount: string;
  escrowId: string;
  sourceId: string;
  targetId: string;
  expirationDate: string;

  constructor({
    securityId,
    partitionId,
    amount,
    escrowId,
    sourceId,
    targetId,
    expirationDate,
  }: {
    securityId: string;
    partitionId: string;
    amount: string;
    escrowId: string;
    sourceId: string;
    targetId: string;
    expirationDate: string;
  }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      partitionId: FormatValidation.checkBytes32Format(),
      amount: FormatValidation.checkAmount(),
      escrowId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      sourceId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      targetId: FormatValidation.checkHederaIdFormatOrEvmAddress(true),
      expirationDate: (val) => {
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
  }
}
