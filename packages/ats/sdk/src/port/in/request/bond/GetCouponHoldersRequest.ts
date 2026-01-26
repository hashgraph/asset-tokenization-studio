// SPDX-License-Identifier: Apache-2.0

import FormatValidation from "@port/in/request/FormatValidation";
import ValidatedRequest from "@core/validation/ValidatedArgs";

export default class GetCouponHoldersRequest extends ValidatedRequest<GetCouponHoldersRequest> {
  securityId: string;
  couponId: number;
  start: number;
  end: number;

  constructor({
    securityId,
    couponId,
    start,
    end,
  }: {
    securityId: string;
    couponId: number;
    start: number;
    end: number;
  }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      couponId: FormatValidation.checkNumber({ min: 0 }),
      start: FormatValidation.checkNumber({ min: 0 }),
      end: FormatValidation.checkNumber({ min: 0 }),
    });

    this.securityId = securityId;
    this.couponId = couponId;
    this.start = start;
    this.end = end;
  }
}
