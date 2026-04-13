// SPDX-License-Identifier: Apache-2.0

import FormatValidation from "@port/in/request/FormatValidation";
import ValidatedRequest from "@core/validation/ValidatedArgs";

export default class GetAmortizationPaymentAmountRequest extends ValidatedRequest<GetAmortizationPaymentAmountRequest> {
  securityId: string;
  amortizationId: number;
  tokenHolder: string;

  constructor({
    securityId,
    amortizationId,
    tokenHolder,
  }: {
    securityId: string;
    amortizationId: number;
    tokenHolder: string;
  }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      amortizationId: FormatValidation.checkNumber({ min: 0 }),
      tokenHolder: FormatValidation.checkHederaIdFormatOrEvmAddress(),
    });

    this.securityId = securityId;
    this.amortizationId = amortizationId;
    this.tokenHolder = tokenHolder;
  }
}
