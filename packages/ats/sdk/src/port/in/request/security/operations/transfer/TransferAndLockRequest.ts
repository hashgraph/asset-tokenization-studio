// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";

export default class TransferAndLockRequest extends ValidatedRequest<TransferAndLockRequest> {
  securityId: string;
  targetId: string;
  amount: string;
  expirationDate: string;

  constructor({
    targetId,
    amount,
    securityId,
    expirationDate,
  }: {
    targetId: string;
    amount: string;
    securityId: string;
    expirationDate: string;
  }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      targetId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      amount: FormatValidation.checkAmount(),
    });

    this.securityId = securityId;
    this.targetId = targetId;
    this.amount = amount;
    this.expirationDate = expirationDate;
  }
}
