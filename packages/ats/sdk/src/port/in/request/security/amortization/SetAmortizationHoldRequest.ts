// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../../FormatValidation";

export default class SetAmortizationHoldRequest extends ValidatedRequest<SetAmortizationHoldRequest> {
  securityId: string;
  amortizationId: number;
  tokenHolder: string;
  tokenAmount: string;

  constructor({
    securityId,
    amortizationId,
    tokenHolder,
    tokenAmount,
  }: {
    securityId: string;
    amortizationId: number;
    tokenHolder: string;
    tokenAmount: string;
  }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      tokenHolder: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      tokenAmount: FormatValidation.checkAmount(),
    });

    this.securityId = securityId;
    this.amortizationId = amortizationId;
    this.tokenHolder = tokenHolder;
    this.tokenAmount = tokenAmount;
  }
}
