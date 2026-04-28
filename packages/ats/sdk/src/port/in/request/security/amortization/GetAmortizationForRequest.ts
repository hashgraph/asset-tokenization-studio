// SPDX-License-Identifier: Apache-2.0

import { MIN_ID } from "@domain/context/security/CorporateAction";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../../FormatValidation";

export default class GetAmortizationForRequest extends ValidatedRequest<GetAmortizationForRequest> {
  securityId: string;
  targetId: string;
  amortizationId: number;

  constructor({
    securityId,
    targetId,
    amortizationId,
  }: {
    securityId: string;
    targetId: string;
    amortizationId: number;
  }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      targetId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      amortizationId: FormatValidation.checkNumber({ min: MIN_ID }),
    });

    this.securityId = securityId;
    this.targetId = targetId;
    this.amortizationId = amortizationId;
  }
}
