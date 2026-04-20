// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../../FormatValidation";

export default class ReleaseAmortizationHoldRequest extends ValidatedRequest<ReleaseAmortizationHoldRequest> {
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
      tokenHolder: FormatValidation.checkHederaIdFormatOrEvmAddress(),
    });

    this.securityId = securityId;
    this.amortizationId = amortizationId;
    this.tokenHolder = tokenHolder;
  }
}
