// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../FormatValidation";

export default class CancelDividendRequest extends ValidatedRequest<CancelDividendRequest> {
  securityId: string;
  dividendId: number;

  constructor({ securityId, dividendId }: { securityId: string; dividendId: number }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
    });

    this.securityId = securityId;
    this.dividendId = dividendId;
  }
}
