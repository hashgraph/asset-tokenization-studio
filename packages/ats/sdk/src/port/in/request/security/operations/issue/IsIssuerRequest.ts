// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";

export default class IsIssuerRequest extends ValidatedRequest<IsIssuerRequest> {
  securityId: string;
  issuerId: string;

  constructor({ securityId, issuerId }: { issuerId: string; securityId: string }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      issuerId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
    });

    this.securityId = securityId;
    this.issuerId = issuerId;
  }
}
