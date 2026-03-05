// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";

export default class GetCorporateActionRequest extends ValidatedRequest<GetCorporateActionRequest> {
  securityId: string;
  corporateActionId: string;

  constructor({ securityId, corporateActionId }: { securityId: string; corporateActionId: string }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      corporateActionId: FormatValidation.checkBytes32Format(),
    });

    this.securityId = securityId;
    this.corporateActionId = corporateActionId;
  }
}
