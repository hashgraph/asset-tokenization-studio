// SPDX-License-Identifier: Apache-2.0

import { ClearingOperationType } from "@domain/context/security/Clearing";
import ValidatedRequest from "@core/validation/ValidatedArgs";

import FormatValidation from "@port/in/request/FormatValidation";

export default class GetClearingsIdForByPartitionRequest extends ValidatedRequest<GetClearingsIdForByPartitionRequest> {
  securityId: string;
  targetId: string;
  partitionId: string;
  clearingOperationType: ClearingOperationType;
  start: number;
  end: number;

  constructor({
    securityId,
    targetId,
    partitionId,
    clearingOperationType,
    start,
    end,
  }: {
    securityId: string;
    targetId: string;
    partitionId: string;
    clearingOperationType: ClearingOperationType;
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
    this.clearingOperationType = clearingOperationType;
    this.start = start;
    this.end = end;
  }
}
