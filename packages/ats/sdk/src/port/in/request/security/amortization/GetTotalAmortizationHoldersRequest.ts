// SPDX-License-Identifier: Apache-2.0

import FormatValidation from "@port/in/request/FormatValidation";
import ValidatedRequest from "@core/validation/ValidatedArgs";

export default class GetTotalAmortizationHoldersRequest extends ValidatedRequest<GetTotalAmortizationHoldersRequest> {
  securityId: string;
  amortizationId: number;

  constructor({ securityId, amortizationId }: { securityId: string; amortizationId: number }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      amortizationId: FormatValidation.checkNumber({ min: 0 }),
    });

    this.securityId = securityId;
    this.amortizationId = amortizationId;
  }
}
