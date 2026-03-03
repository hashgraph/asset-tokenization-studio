// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../FormatValidation";

export default class CancelCouponRequest extends ValidatedRequest<CancelCouponRequest> {
  securityId: string;
  couponId: number;

  constructor({ securityId, couponId }: { securityId: string; couponId: number }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
    });

    this.securityId = securityId;
    this.couponId = couponId;
  }
}
