// SPDX-License-Identifier: Apache-2.0

import { ClearingOperationType } from "@domain/context/security/Clearing";
import ValidatedRequest from "@core/validation/ValidatedArgs";

import FormatValidation from "@port/in/request/FormatValidation";

export default class GetClearingCountForByPartitionRequest extends ValidatedRequest<GetClearingCountForByPartitionRequest> {
  securityId: string;
  targetId: string;
  partitionId: string;
  clearingOperationType: ClearingOperationType;

  constructor({
    securityId,
    targetId,
    partitionId,
    clearingOperationType,
  }: {
    securityId: string;
    targetId: string;
    partitionId: string;
    clearingOperationType: ClearingOperationType;
  }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      targetId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      partitionId: FormatValidation.checkBytes32Format(),
    });

    this.securityId = securityId;
    this.targetId = targetId;
    this.partitionId = partitionId;
    this.clearingOperationType = clearingOperationType;
  }
}
