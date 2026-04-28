// SPDX-License-Identifier: Apache-2.0

import FormatValidation from "@port/in/request/FormatValidation";
import ValidatedRequest from "@core/validation/ValidatedArgs";

export default class GetAmortizationHoldersRequest extends ValidatedRequest<GetAmortizationHoldersRequest> {
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
      amortizationId: FormatValidation.checkNumber({ min: 0 }),
      start: FormatValidation.checkNumber({ min: 0 }),
      end: FormatValidation.checkNumber({ min: 0 }),
    });

    this.securityId = securityId;
    this.amortizationId = amortizationId;
    this.start = start;
    this.end = end;
  }
}
