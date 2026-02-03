// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";

export default class RedeemRequest extends ValidatedRequest<RedeemRequest> {
  securityId: string;
  amount: string;

  constructor({ amount, securityId }: { amount: string; securityId: string }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      amount: FormatValidation.checkAmount(),
    });

    this.securityId = securityId;
    this.amount = amount;
  }
}
