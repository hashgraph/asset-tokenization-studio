// SPDX-License-Identifier: Apache-2.0

import { MIN_ID } from "@domain/context/security/CorporateAction";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../FormatValidation";

export default class GetScheduledBalanceAdjustmentRequest extends ValidatedRequest<GetScheduledBalanceAdjustmentRequest> {
  securityId: string;
  balanceAdjustmentId: number;

  constructor({ securityId, balanceAdjustmentId }: { securityId: string; balanceAdjustmentId: number }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      balanceAdjustmentId: FormatValidation.checkNumber({
        max: undefined,
        min: MIN_ID,
      }),
    });
    this.securityId = securityId;
    this.balanceAdjustmentId = balanceAdjustmentId;
  }
}
