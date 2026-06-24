// SPDX-License-Identifier: Apache-2.0

import { MIN_ID } from "@domain/context/security/CorporateAction";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../FormatValidation";

export default class GetDividendsRequest extends ValidatedRequest<GetDividendsRequest> {
  securityId: string;
  dividendId: number;

  constructor({ securityId, dividendId }: { securityId: string; dividendId: number }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      dividendId: FormatValidation.checkNumber({
        max: undefined,
        min: MIN_ID,
      }),
    });
    this.securityId = securityId;
    this.dividendId = dividendId;
  }
}
