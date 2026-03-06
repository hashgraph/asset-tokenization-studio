// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../FormatValidation";

export default class SetRateRequest extends ValidatedRequest<SetRateRequest> {
  securityId: string;
  rate: string;
  rateDecimals: number;

  constructor({ securityId, rate, rateDecimals }: { securityId: string; rate: string; rateDecimals: number }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      rate: FormatValidation.checkNumber({ min: 0 }),
      rateDecimals: FormatValidation.checkNumber({ min: 0 }),
    });
    this.securityId = securityId;
    this.rate = rate;
    this.rateDecimals = rateDecimals;
  }
}
