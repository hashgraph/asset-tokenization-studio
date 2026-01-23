// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";

export default class LockRequest extends ValidatedRequest<LockRequest> {
  securityId: string;
  targetId: string;
  amount: string;
  expirationTimestamp: string;

  constructor({
    targetId,
    amount,
    securityId,
    expirationTimestamp,
  }: {
    targetId: string;
    amount: string;
    securityId: string;
    expirationTimestamp: string;
  }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      targetId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      amount: FormatValidation.checkAmount(),
    });

    this.securityId = securityId;
    this.targetId = targetId;
    this.amount = amount;
    this.expirationTimestamp = expirationTimestamp;
  }
}
