// SPDX-License-Identifier: Apache-2.0

import { MIN_ID } from "@domain/context/security/CorporateAction";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../FormatValidation";

export default class GetCouponForRequest extends ValidatedRequest<GetCouponForRequest> {
  securityId: string;
  targetId: string;
  couponId: number;

  constructor({ targetId, securityId, couponId }: { targetId: string; securityId: string; couponId: number }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      targetId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      couponId: FormatValidation.checkNumber({
        max: undefined,
        min: MIN_ID,
      }),
    });
    this.securityId = securityId;
    this.targetId = targetId;
    this.couponId = couponId;
  }
}
