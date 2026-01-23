// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../FormatValidation";

export default class GetProceedRecipientsRequest extends ValidatedRequest<GetProceedRecipientsRequest> {
  securityId: string;
  pageIndex: number;
  pageSize: number;

  constructor({ securityId, pageIndex, pageSize }: { securityId: string; pageIndex: number; pageSize: number }) {
    super({
      pageIndex: FormatValidation.checkNumber({ min: 0 }),
      pageSize: FormatValidation.checkNumber({ min: 1 }),

      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
    });
    this.securityId = securityId;
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;
  }
}
