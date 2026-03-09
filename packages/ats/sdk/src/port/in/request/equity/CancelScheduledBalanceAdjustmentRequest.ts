// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../FormatValidation";

export default class CancelScheduledBalanceAdjustmentRequest extends ValidatedRequest<CancelScheduledBalanceAdjustmentRequest> {
  securityId: string;
  balanceAdjustmentId: number;

  constructor({ securityId, balanceAdjustmentId }: { securityId: string; balanceAdjustmentId: number }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
    });

    this.securityId = securityId;
    this.balanceAdjustmentId = balanceAdjustmentId;
  }
}
