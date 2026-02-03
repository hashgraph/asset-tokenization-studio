// SPDX-License-Identifier: Apache-2.0

import { ClearingOperationType } from "@domain/context/security/Clearing";
import ValidatedRequest from "@core/validation/ValidatedArgs";

import FormatValidation from "@port/in/request/FormatValidation";

export default class CancelClearingOperationByPartitionRequest extends ValidatedRequest<CancelClearingOperationByPartitionRequest> {
  securityId: string;
  partitionId: string;
  targetId: string;
  clearingId: number;
  clearingOperationType: ClearingOperationType;

  constructor({
    securityId,
    partitionId,
    targetId,
    clearingId,
    clearingOperationType,
  }: {
    securityId: string;
    partitionId: string;
    targetId: string;
    clearingId: number;
    clearingOperationType: ClearingOperationType;
  }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      partitionId: FormatValidation.checkBytes32Format(),
      clearingId: FormatValidation.checkNumber({ min: 0 }),
      targetId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
    });

    this.securityId = securityId;
    this.partitionId = partitionId;
    this.targetId = targetId;
    this.clearingId = clearingId;
    this.clearingOperationType = clearingOperationType;
  }
}
