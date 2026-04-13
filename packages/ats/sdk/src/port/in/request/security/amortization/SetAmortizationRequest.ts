// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../../FormatValidation";
import { SecurityDate } from "@domain/context/shared/SecurityDate";

export default class SetAmortizationRequest extends ValidatedRequest<SetAmortizationRequest> {
  securityId: string;
  recordTimestamp: string;
  executionTimestamp: string;
  tokensToRedeem: string;

  constructor({
    securityId,
    recordTimestamp,
    executionTimestamp,
    tokensToRedeem,
  }: {
    securityId: string;
    recordTimestamp: string;
    executionTimestamp: string;
    tokensToRedeem: string;
  }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      tokensToRedeem: FormatValidation.checkAmount(),
      recordTimestamp: (val) => {
        return SecurityDate.checkDateTimestamp(
          parseInt(val),
          Math.ceil(new Date().getTime() / 1000),
          parseInt(this.executionTimestamp),
        );
      },
      executionTimestamp: (val) => {
        return SecurityDate.checkDateTimestamp(parseInt(val), parseInt(this.recordTimestamp), undefined);
      },
    });

    this.securityId = securityId;
    this.recordTimestamp = recordTimestamp;
    this.executionTimestamp = executionTimestamp;
    this.tokensToRedeem = tokensToRedeem;
  }
}
