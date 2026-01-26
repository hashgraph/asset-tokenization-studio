// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";

export default class GetHoldForByPartitionRequest extends ValidatedRequest<GetHoldForByPartitionRequest> {
  securityId: string;
  targetId: string;
  partitionId: string;
  holdId: number;

  constructor({
    securityId,
    targetId,
    partitionId,
    holdId,
  }: {
    securityId: string;
    targetId: string;
    partitionId: string;
    holdId: number;
  }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      targetId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      partitionId: FormatValidation.checkBytes32Format(),
    });

    this.securityId = securityId;
    this.targetId = targetId;
    this.partitionId = partitionId;
    this.holdId = holdId;
  }
}
