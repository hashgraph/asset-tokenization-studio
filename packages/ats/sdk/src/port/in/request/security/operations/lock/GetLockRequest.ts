// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";

export default class GetLockRequest extends ValidatedRequest<GetLockRequest> {
  securityId: string;
  targetId: string;
  id: number;

  constructor({ securityId, targetId, id }: { securityId: string; targetId: string; id: number }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      targetId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
    });
    this.securityId = securityId;
    this.targetId = targetId;
    this.id = id;
  }
}
