// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../FormatValidation";

export default class GetLoanDetailsRequest extends ValidatedRequest<GetLoanDetailsRequest> {
  loanId: string;

  constructor({ loanId }: { loanId: string }) {
    super({
      loanId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
    });

    this.loanId = loanId;
  }
}
