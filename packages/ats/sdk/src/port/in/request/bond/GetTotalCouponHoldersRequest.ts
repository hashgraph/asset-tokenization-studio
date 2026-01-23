// SPDX-License-Identifier: Apache-2.0

import FormatValidation from "@port/in/request/FormatValidation";
import ValidatedRequest from "@core/validation/ValidatedArgs";

export default class GetTotalCouponHoldersRequest extends ValidatedRequest<GetTotalCouponHoldersRequest> {
  securityId: string;
  couponId: number;

  constructor({ securityId, couponId }: { securityId: string; couponId: number }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      couponId: FormatValidation.checkNumber({ min: 0 }),
    });

    this.securityId = securityId;
    this.couponId = couponId;
  }
}
