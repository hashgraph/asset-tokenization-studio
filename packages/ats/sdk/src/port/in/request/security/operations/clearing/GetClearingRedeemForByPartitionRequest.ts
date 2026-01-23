// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";

import FormatValidation from "@port/in/request/FormatValidation";

export default class GetClearingRedeemForByPartitionRequest extends ValidatedRequest<GetClearingRedeemForByPartitionRequest> {
  securityId: string;
  targetId: string;
  partitionId: string;
  clearingId: number;

  constructor({
    securityId,
    targetId,
    partitionId,
    clearingId,
  }: {
    securityId: string;
    targetId: string;
    partitionId: string;
    clearingId: number;
  }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      targetId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      partitionId: FormatValidation.checkBytes32Format(),
    });

    this.securityId = securityId;
    this.targetId = targetId;
    this.partitionId = partitionId;
    this.clearingId = clearingId;
  }
}
