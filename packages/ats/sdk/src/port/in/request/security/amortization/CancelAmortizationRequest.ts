// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../../FormatValidation";

export default class CancelAmortizationRequest extends ValidatedRequest<CancelAmortizationRequest> {
  securityId: string;
  amortizationId: number;

  constructor({ securityId, amortizationId }: { securityId: string; amortizationId: number }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
    });

    this.securityId = securityId;
    this.amortizationId = amortizationId;
  }
}
