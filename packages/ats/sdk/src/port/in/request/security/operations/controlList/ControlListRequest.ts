// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";

import FormatValidation from "@port/in/request/FormatValidation";

export default class ControlListRequest extends ValidatedRequest<ControlListRequest> {
  securityId: string;
  targetId: string;

  constructor({ securityId, targetId }: { securityId: string; targetId: string }) {
    super({
      targetId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
    });
    this.securityId = securityId;
    this.targetId = targetId;
  }
}
