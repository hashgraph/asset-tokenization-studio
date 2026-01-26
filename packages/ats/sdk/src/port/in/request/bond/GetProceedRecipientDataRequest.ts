// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../FormatValidation";

export default class GetProceedRecipientDataRequest extends ValidatedRequest<GetProceedRecipientDataRequest> {
  securityId: string;
  proceedRecipientId: string;

  constructor({ securityId, proceedRecipientId }: { securityId: string; proceedRecipientId: string }) {
    super({
      proceedRecipientId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
    });
    this.securityId = securityId;
    this.proceedRecipientId = proceedRecipientId;
  }
}
