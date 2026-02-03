// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../../../FormatValidation";

export default class ForcedTransferRequest extends ValidatedRequest<ForcedTransferRequest> {
  securityId: string;
  sourceId: string;
  targetId: string;
  amount: string;

  constructor({
    sourceId,
    targetId,
    amount,
    securityId,
  }: {
    sourceId: string;
    targetId: string;
    amount: string;
    securityId: string;
  }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      sourceId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      targetId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      amount: FormatValidation.checkAmount(),
    });

    this.securityId = securityId;
    this.sourceId = sourceId;
    this.targetId = targetId;
    this.amount = amount;
  }
}
