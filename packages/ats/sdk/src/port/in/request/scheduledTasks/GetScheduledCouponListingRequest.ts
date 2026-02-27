// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../FormatValidation";

export default class GetScheduledCouponListingRequest extends ValidatedRequest<GetScheduledCouponListingRequest> {
  securityId: string;
  pageIndex: number;
  pageLength: number;

  constructor({ securityId, pageIndex, pageLength }: { securityId: string; pageIndex: number; pageLength: number }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      pageIndex: FormatValidation.checkNumber({ min: 0 }),
      pageLength: FormatValidation.checkNumber({ min: 0 }),
    });
    this.securityId = securityId;
    this.pageIndex = pageIndex;
    this.pageLength = pageLength;
  }
}
