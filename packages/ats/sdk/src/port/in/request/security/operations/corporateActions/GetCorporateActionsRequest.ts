// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";

export default class GetCorporateActionsRequest extends ValidatedRequest<GetCorporateActionsRequest> {
  securityId: string;
  pageIndex: number;
  pageLength: number;

  constructor({ securityId, pageIndex, pageLength }: { securityId: string; pageIndex: number; pageLength: number }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      pageIndex: FormatValidation.checkIsNotNegative(),
      pageLength: FormatValidation.checkIsPositive(),
    });

    this.securityId = securityId;
    this.pageIndex = pageIndex;
    this.pageLength = pageLength;
  }
}
