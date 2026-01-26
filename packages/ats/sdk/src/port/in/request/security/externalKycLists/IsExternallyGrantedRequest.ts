// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../../FormatValidation";

export default class IsExternallyGrantedRequest extends ValidatedRequest<IsExternallyGrantedRequest> {
  securityId: string;
  kycStatus: number;
  targetId: string;

  constructor({ securityId, kycStatus, targetId }: { securityId: string; kycStatus: number; targetId: string }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      kycStatus: FormatValidation.checkNumber({ min: 0 }),
      targetId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
    });
    this.securityId = securityId;
    this.kycStatus = kycStatus;
    this.targetId = targetId;
  }
}
