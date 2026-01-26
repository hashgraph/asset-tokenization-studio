// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";

export default class ReleaseHoldByPartitionRequest extends ValidatedRequest<ReleaseHoldByPartitionRequest> {
  securityId: string;
  partitionId: string;
  targetId: string;
  holdId: number;
  amount: string;

  constructor({
    targetId,
    partitionId,
    securityId,
    holdId,
    amount,
  }: {
    targetId: string;
    partitionId: string;
    holdId: number;
    securityId: string;
    amount: string;
  }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      targetId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      partitionId: FormatValidation.checkBytes32Format(),
      amount: FormatValidation.checkAmount(),
      holdId: FormatValidation.checkNumber({ min: 0 }),
    });

    this.securityId = securityId;
    this.targetId = targetId;
    this.holdId = holdId;
    this.partitionId = partitionId;
    this.amount = amount;
    this.holdId = holdId;
  }
}
