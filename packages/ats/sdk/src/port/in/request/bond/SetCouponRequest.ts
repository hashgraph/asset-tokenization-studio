// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../FormatValidation";

import { SecurityDate } from "@domain/context/shared/SecurityDate";
import { Bond } from "@domain/context/bond/Bond";

export default class SetCouponRequest extends ValidatedRequest<SetCouponRequest> {
  securityId: string;
  rate: string;
  recordTimestamp: string;
  executionTimestamp: string;
  startTimestamp: string;
  endTimestamp: string;
  fixingTimestamp: string;
  rateStatus: number;

  constructor({
    securityId,
    rate,
    recordTimestamp,
    executionTimestamp,
    startTimestamp,
    endTimestamp,
    fixingTimestamp,
    rateStatus,
  }: {
    securityId: string;
    rate: string;
    recordTimestamp: string;
    executionTimestamp: string;
    startTimestamp: string;
    endTimestamp: string;
    fixingTimestamp: string;
    rateStatus: number;
  }) {
    super({
      rate: FormatValidation.checkAmount(true),
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
      endTimestamp: (val) => {
        return SecurityDate.checkDateTimestamp(parseInt(val), parseInt(this.startTimestamp), undefined);
      },
      fixingTimestamp: (val) => {
        return SecurityDate.checkDateTimestamp(parseInt(val), undefined, parseInt(this.executionTimestamp));
      },
      rateStatus: (val) => {
        return Bond.checkRateStatus(val);
      },
    });

    this.securityId = securityId;
    this.rate = rate;
    this.recordTimestamp = recordTimestamp;
    this.executionTimestamp = executionTimestamp;
    this.startTimestamp = startTimestamp;
    this.endTimestamp = endTimestamp;
    this.fixingTimestamp = fixingTimestamp;
    this.rateStatus = rateStatus;
  }
}
