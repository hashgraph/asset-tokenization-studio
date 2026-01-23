// SPDX-License-Identifier: Apache-2.0

import FormatValidation from "@port/in/request/FormatValidation";
import ValidatedRequest from "@core/validation/ValidatedArgs";

export default class GetTotalDividendHoldersRequest extends ValidatedRequest<GetTotalDividendHoldersRequest> {
  securityId: string;
  dividendId: number;

  constructor({ securityId, dividendId }: { securityId: string; dividendId: number }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      dividendId: FormatValidation.checkNumber({ min: 0 }),
    });

    this.securityId = securityId;
    this.dividendId = dividendId;
  }
}
