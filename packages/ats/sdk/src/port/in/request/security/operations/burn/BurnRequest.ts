// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../../../FormatValidation";

export default class BurnRequest extends ValidatedRequest<BurnRequest> {
  securityId: string;
  sourceId: string;
  amount: string;

  constructor({ amount, securityId, sourceId }: { amount: string; securityId: string; sourceId: string }) {
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
