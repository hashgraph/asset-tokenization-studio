// SPDX-License-Identifier: Apache-2.0

import { MIN_ID } from "@domain/context/security/CorporateAction";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../FormatValidation";

export default class GetCouponsForRequest extends ValidatedRequest<GetCouponsForRequest> {
  securityId: string;
  couponId: number;
  pageIndex: number;
  pageLength: number;

  constructor({
    securityId,
    couponId,
    pageIndex,
    pageLength,
  }: {
    securityId: string;
    couponId: number;
    pageIndex: number;
    pageLength: number;
  }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      couponId: FormatValidation.checkNumber({
        max: undefined,
        min: MIN_ID,
      }),
      pageIndex: FormatValidation.checkNumber({
        max: undefined,
        min: 0,
      }),
      pageLength: FormatValidation.checkNumber({
        max: undefined,
        min: 1,
      }),
    });
    this.securityId = securityId;
    this.couponId = couponId;
    this.pageIndex = pageIndex;
    this.pageLength = pageLength;
  }
}
