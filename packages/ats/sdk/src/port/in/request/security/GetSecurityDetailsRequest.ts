// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../FormatValidation";

export default class GetSecurityDetailsRequest extends ValidatedRequest<GetSecurityDetailsRequest> {
  securityId: string;

  constructor({ securityId }: { securityId: string }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
    });

    this.securityId = securityId;
  }
}
