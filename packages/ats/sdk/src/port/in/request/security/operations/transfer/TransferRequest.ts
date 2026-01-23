// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";

export default class TransferRequest extends ValidatedRequest<TransferRequest> {
  securityId: string;
  targetId: string;
  amount: string;

  constructor({ targetId, amount, securityId }: { targetId: string; amount: string; securityId: string }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      targetId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      amount: FormatValidation.checkAmount(),
    });

    this.securityId = securityId;
    this.targetId = targetId;
    this.amount = amount;
  }
}
