// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";

export default class GetLockedBalanceRequest extends ValidatedRequest<GetLockedBalanceRequest> {
  securityId: string;
  targetId: string;

  constructor({ securityId, targetId }: { securityId: string; targetId: string }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      targetId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
    });
    this.securityId = securityId;
    this.targetId = targetId;
  }
}
