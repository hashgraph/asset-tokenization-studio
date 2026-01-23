// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../../FormatValidation";

export default class GrantKycRequest extends ValidatedRequest<GrantKycRequest> {
  securityId: string;
  targetId: string;
  vcBase64: string;

  constructor({ securityId, targetId, vcBase64 }: { securityId: string; targetId: string; vcBase64: string }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      targetId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      vcBase64: FormatValidation.checkBase64Format(),
    });

    this.securityId = securityId;
    this.targetId = targetId;
    this.vcBase64 = vcBase64;
  }
}
