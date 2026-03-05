// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";

export default class GetCorporateActionsRequest extends ValidatedRequest<GetCorporateActionsRequest> {
  securityId: string;
  start: number;
  end: number;

  constructor({ securityId, start, end }: { securityId: string; start: number; end: number }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      start: FormatValidation.checkNumber({ min: 0 }),
      end: FormatValidation.checkNumber({ min: 1 }),
    });

    this.securityId = securityId;
    this.start = start;
    this.end = end;
  }
}
