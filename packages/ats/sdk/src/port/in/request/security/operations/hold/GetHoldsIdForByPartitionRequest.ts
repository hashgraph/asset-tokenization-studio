// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";

export default class GetHoldsIdForByPartitionRequest extends ValidatedRequest<GetHoldsIdForByPartitionRequest> {
  securityId: string;
  targetId: string;
  partitionId: string;
  start: number;
  end: number;

  constructor({
    securityId,
    targetId,
    partitionId,
    start,
    end,
  }: {
    securityId: string;
    targetId: string;
    partitionId: string;
    start: number;
    end: number;
  }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      targetId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      partitionId: FormatValidation.checkBytes32Format(),
      start: FormatValidation.checkNumber({ min: 0 }),
      end: FormatValidation.checkNumber({ min: 0 }),
    });

    this.securityId = securityId;
    this.targetId = targetId;
    this.partitionId = partitionId;
    this.start = start;
    this.end = end;
  }
}
