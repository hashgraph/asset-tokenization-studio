// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../FormatValidation";
import { SecurityDate } from "@domain/context/shared/SecurityDate";

export default class SetScheduledBalanceAdjustmentRequest extends ValidatedRequest<SetScheduledBalanceAdjustmentRequest> {
  securityId: string;
  executionDate: string;
  factor: string;
  decimals: string;

  constructor({
    securityId,
    executionDate,
    factor,
    decimals,
  }: {
    securityId: string;
    executionDate: string;
    factor: string;
    decimals: string;
  }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      executionDate: (val) => {
        return SecurityDate.checkDateTimestamp(parseInt(val), Math.ceil(new Date().getTime() / 1000));
      },
      factor: FormatValidation.checkAmount(),
      decimals: FormatValidation.checkAmount(true),
    });

    this.securityId = securityId;
    this.executionDate = executionDate;
    this.factor = factor;
    this.decimals = decimals;
  }
}
