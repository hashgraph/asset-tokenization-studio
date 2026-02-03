// SPDX-License-Identifier: Apache-2.0

import { MIN_ID } from "@domain/context/security/CorporateAction";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../FormatValidation";

export default class GetDividendsForRequest extends ValidatedRequest<GetDividendsForRequest> {
  securityId: string;
  targetId: string;
  dividendId: number;

  constructor({ securityId, targetId, dividendId }: { securityId: string; targetId: string; dividendId: number }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      targetId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      dividendId: FormatValidation.checkNumber({
        max: undefined,
        min: MIN_ID,
      }),
    });
    this.securityId = securityId;
    this.targetId = targetId;
    this.dividendId = dividendId;
  }
}
