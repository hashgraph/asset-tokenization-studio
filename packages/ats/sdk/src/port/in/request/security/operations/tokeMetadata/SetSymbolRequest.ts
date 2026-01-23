// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";

export default class SetSymbolRequest extends ValidatedRequest<SetSymbolRequest> {
  securityId: string;
  symbol: string;

  constructor({ securityId, symbol }: { securityId: string; symbol: string }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      symbol: FormatValidation.checkString({ emptyCheck: true }),
    });

    this.securityId = securityId;
    this.symbol = symbol;
  }
}
