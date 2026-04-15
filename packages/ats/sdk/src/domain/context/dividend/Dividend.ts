// SPDX-License-Identifier: Apache-2.0

import ValidatedDomain from "@core/validation/ValidatedArgs";
import BigDecimal from "../shared/BigDecimal";
import { SecurityDate } from "../shared/SecurityDate";

export class Dividend extends ValidatedDomain<Dividend> {
  amountPerUnitOfSecurity: BigDecimal;
  amountDecimals: number;
  recordTimeStamp: number;
  executionTimeStamp: number;
  snapshotId?: number;
  isDisabled: boolean;

  constructor(
    amountPerUnitOfSecurity: BigDecimal,
    amountDecimals: number,
    recordTimeStamp: number,
    executionTimeStamp: number,
    snapshotId?: number,
    isDisabled: boolean = false,
  ) {
    super({
      executionTimeStamp: (val) => {
        return SecurityDate.checkDateTimestamp(val, this.recordTimeStamp);
      },
    });

    this.amountPerUnitOfSecurity = amountPerUnitOfSecurity;
    this.amountDecimals = amountDecimals;
    this.recordTimeStamp = recordTimeStamp;
    this.executionTimeStamp = executionTimeStamp;
    this.snapshotId = snapshotId ? snapshotId : undefined;
    this.isDisabled = isDisabled;

    ValidatedDomain.handleValidation(Dividend.name, this);
  }
}
