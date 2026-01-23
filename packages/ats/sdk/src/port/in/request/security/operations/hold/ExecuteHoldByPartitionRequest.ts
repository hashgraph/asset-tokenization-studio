// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";

export default class ExecuteHoldByPartitionRequest extends ValidatedRequest<ExecuteHoldByPartitionRequest> {
  securityId: string;
  sourceId: string;
  amount: string;
  holdId: number;
  targetId: string;
  partitionId: string;

  constructor({
    targetId,
    sourceId,
    holdId,
    securityId,
    amount,
    partitionId,
  }: {
    securityId: string;
    sourceId: string;
    amount: string;
    holdId: number;
    targetId: string;
    partitionId: string;
  }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      sourceId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      targetId: FormatValidation.checkHederaIdFormatOrEvmAddress(true),
      holdId: FormatValidation.checkNumber({ min: 0 }),
      amount: FormatValidation.checkAmount(),
      partitionId: FormatValidation.checkBytes32Format(),
    });

    this.securityId = securityId;
    this.sourceId = sourceId;
    this.targetId = targetId;
    this.holdId = holdId;
    this.amount = amount;
    this.partitionId = partitionId;
  }
}
