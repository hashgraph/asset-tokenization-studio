// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../../FormatValidation";

export default class SetComplianceRequest extends ValidatedRequest<SetComplianceRequest> {
  securityId: string;
  compliance: string;

  constructor({ securityId, compliance }: { securityId: string; compliance: string }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      compliance: FormatValidation.checkHederaIdFormatOrEvmAddress(),
    });

    this.securityId = securityId;
    this.compliance = compliance;
  }
}
