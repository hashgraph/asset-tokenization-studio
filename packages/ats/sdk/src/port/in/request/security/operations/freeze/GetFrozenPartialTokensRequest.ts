// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";

import FormatValidation from "@port/in/request/FormatValidation";

export default class GetFrozenPartialTokensRequest extends ValidatedRequest<GetFrozenPartialTokensRequest> {
  securityId: string;
  targetId: string;

  constructor({ securityId, targetId }: { securityId: string; targetId: string }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      targetId: FormatValidation.checkHederaIdFormatOrEvmAddress(true),
    });
    this.securityId = securityId;
    this.targetId = targetId;
  }
}
