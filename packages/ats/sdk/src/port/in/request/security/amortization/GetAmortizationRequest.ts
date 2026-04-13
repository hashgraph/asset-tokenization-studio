// SPDX-License-Identifier: Apache-2.0

import { MIN_ID } from "@domain/context/security/CorporateAction";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../../FormatValidation";

export default class GetAmortizationRequest extends ValidatedRequest<GetAmortizationRequest> {
  securityId: string;
  amortizationId: number;

  constructor({ securityId, amortizationId }: { securityId: string; amortizationId: number }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      amortizationId: FormatValidation.checkNumber({ min: MIN_ID }),
    });

    this.securityId = securityId;
    this.amortizationId = amortizationId;
  }
}
