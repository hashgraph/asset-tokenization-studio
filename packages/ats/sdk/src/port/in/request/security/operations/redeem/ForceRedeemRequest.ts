// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";

export default class ForceRedeemRequest extends ValidatedRequest<ForceRedeemRequest> {
  securityId: string;
  sourceId: string;
  amount: string;

  constructor({ sourceId, amount, securityId }: { sourceId: string; amount: string; securityId: string }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      sourceId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      amount: FormatValidation.checkAmount(),
    });

    this.securityId = securityId;
    this.sourceId = sourceId;
    this.amount = amount;
  }
}
