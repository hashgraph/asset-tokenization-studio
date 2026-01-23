// SPDX-License-Identifier: Apache-2.0

import ValidatedDomain from "@core/validation/ValidatedArgs";
import { SecurityDate } from "../shared/SecurityDate";

export const MIN_ID = 1;

export class CorporateAction extends ValidatedDomain<CorporateAction> {
  public id: string;
  public actionType: string;
  public recordDateTimestamp: number;
  public executionDateTimestamp: number;

  constructor(id: string, actionType: string, recordDateTimestamp: number, executionDateTimestamp: number) {
    super({
      executionDateTimestamp: (val) => {
        return SecurityDate.checkDateTimestamp(val, this.recordDateTimestamp);
      },
    });

    this.id = id;
    this.actionType = actionType;
    this.recordDateTimestamp = recordDateTimestamp;
    this.executionDateTimestamp = executionDateTimestamp;

    ValidatedDomain.handleValidation(CorporateAction.name, this);
  }
}
