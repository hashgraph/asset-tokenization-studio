// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";

export default class GetCouponFromOrderedListAtRequest extends ValidatedRequest<GetCouponFromOrderedListAtRequest> {
  securityId: string;
  pos: number;

  constructor({ securityId, pos }: { securityId: string; pos: number }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      pos: FormatValidation.checkNumber({ min: 0 }),
    });

    this.securityId = securityId;
    this.pos = pos;
  }
}
