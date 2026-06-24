// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../FormatValidation";

import { SecurityDate } from "@domain/context/shared/SecurityDate";

export default class SetDividendsRequest extends ValidatedRequest<SetDividendsRequest> {
  securityId: string;
  amountPerUnitOfSecurity: string;
  recordTimestamp: string;
  executionTimestamp: string;

  constructor({
    securityId,
    amountPerUnitOfSecurity,
    recordTimestamp,
    executionTimestamp,
  }: {
    securityId: string;
    amountPerUnitOfSecurity: string;
    recordTimestamp: string;
    executionTimestamp: string;
  }) {
    super({
      amountPerUnitOfSecurity: FormatValidation.checkAmount(),
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
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
    });

    this.securityId = securityId;
    this.amountPerUnitOfSecurity = amountPerUnitOfSecurity;
    this.recordTimestamp = recordTimestamp;
    this.executionTimestamp = executionTimestamp;
  }
}
