// SPDX-License-Identifier: Apache-2.0

import FormatValidation from "@port/in/request/FormatValidation";
import ValidatedRequest from "@core/validation/ValidatedArgs";

export default class GetDividendHoldersRequest extends ValidatedRequest<GetDividendHoldersRequest> {
  securityId: string;
  dividendId: number;
  start: number;
  end: number;

  constructor({
    securityId,
    dividendId,
    start,
    end,
  }: {
    securityId: string;
    dividendId: number;
    start: number;
    end: number;
  }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      dividendId: FormatValidation.checkNumber({ min: 0 }),
      start: FormatValidation.checkNumber({ min: 0 }),
      end: FormatValidation.checkNumber({ min: 0 }),
    });

    this.securityId = securityId;
    this.dividendId = dividendId;
    this.start = start;
    this.end = end;
  }
}
