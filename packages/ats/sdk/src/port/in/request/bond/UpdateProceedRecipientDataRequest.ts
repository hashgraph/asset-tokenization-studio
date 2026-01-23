// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../FormatValidation";

export default class UpdateProceedRecipientDataRequest extends ValidatedRequest<UpdateProceedRecipientDataRequest> {
  securityId: string;
  proceedRecipientId: string;
  data: string;

  constructor({
    securityId,
    proceedRecipientId,
    data,
  }: {
    securityId: string;
    proceedRecipientId: string;
    data: string;
  }) {
    super({
      proceedRecipientId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      data: (val) => {
        const validation = FormatValidation.checkBytesFormat();
        if (val == "") return;
        const result = validation(val);
        if (result) return result;
      },
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
    });
    this.securityId = securityId;
    this.proceedRecipientId = proceedRecipientId;
    this.data = data;
  }
}
