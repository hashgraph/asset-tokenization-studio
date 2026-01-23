// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";

export default class GetHoldCountForByPartitionRequest extends ValidatedRequest<GetHoldCountForByPartitionRequest> {
  securityId: string;
  targetId: string;
  partitionId: string;

  constructor({ securityId, targetId, partitionId }: { securityId: string; targetId: string; partitionId: string }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      targetId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      partitionId: FormatValidation.checkBytes32Format(),
    });

    this.securityId = securityId;
    this.targetId = targetId;
    this.partitionId = partitionId;
  }
}
