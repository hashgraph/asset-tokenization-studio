// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";

import FormatValidation from "@port/in/request/FormatValidation";

export default class UnfreezePartialTokensRequest extends ValidatedRequest<UnfreezePartialTokensRequest> {
  securityId: string;
  amount: string;
  targetId: string;

  constructor({ securityId, amount, targetId }: { securityId: string; amount: string; targetId: string }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      amount: FormatValidation.checkAmount(),
      targetId: FormatValidation.checkHederaIdFormatOrEvmAddress(true),
    });
    this.securityId = securityId;
    this.amount = amount;
    this.targetId = targetId;
  }
}
