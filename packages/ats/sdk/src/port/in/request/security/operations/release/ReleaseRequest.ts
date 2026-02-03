// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";

export default class ReleaseRequest extends ValidatedRequest<ReleaseRequest> {
  securityId: string;
  targetId: string;
  lockId: number;

  constructor({ targetId, lockId, securityId }: { targetId: string; lockId: number; securityId: string }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      targetId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
    });

    this.securityId = securityId;
    this.targetId = targetId;
    this.lockId = lockId;
  }
}
