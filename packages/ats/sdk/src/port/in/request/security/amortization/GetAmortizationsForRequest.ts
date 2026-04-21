// SPDX-License-Identifier: Apache-2.0

import { MIN_ID } from "@domain/context/security/CorporateAction";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../../FormatValidation";

export default class GetAmortizationsForRequest extends ValidatedRequest<GetAmortizationsForRequest> {
  securityId: string;
  amortizationId: number;
  start: number;
  end: number;

  constructor({
    securityId,
    amortizationId,
    start,
    end,
  }: {
    securityId: string;
    amortizationId: number;
    start: number;
    end: number;
  }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      amortizationId: FormatValidation.checkNumber({ min: MIN_ID }),
      start: FormatValidation.checkNumber({ min: 0 }),
      end: FormatValidation.checkNumber({ min: 0 }),
    });

    this.securityId = securityId;
    this.amortizationId = amortizationId;
    this.start = start;
    this.end = end;
  }
}
