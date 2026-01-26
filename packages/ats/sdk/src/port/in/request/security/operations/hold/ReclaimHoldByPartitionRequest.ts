// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";

export default class ReclaimHoldByPartitionRequest extends ValidatedRequest<ReclaimHoldByPartitionRequest> {
  securityId: string;
  partitionId: string;
  targetId: string;
  holdId: number;

  constructor({
    targetId,
    partitionId,
    securityId,
    holdId,
  }: {
    targetId: string;
    partitionId: string;
    holdId: number;
    securityId: string;
  }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      targetId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      partitionId: FormatValidation.checkBytes32Format(),
      holdId: FormatValidation.checkNumber({ min: 0 }),
    });

    this.securityId = securityId;
    this.targetId = targetId;
    this.holdId = holdId;
    this.partitionId = partitionId;
    this.holdId = holdId;
  }
}
