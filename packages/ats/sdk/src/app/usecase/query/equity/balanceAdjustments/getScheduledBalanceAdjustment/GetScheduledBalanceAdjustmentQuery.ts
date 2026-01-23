// SPDX-License-Identifier: Apache-2.0

import { ScheduledBalanceAdjustment } from "@domain/context/equity/ScheduledBalanceAdjustment";
import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetScheduledBalanceAdjustmentQueryResponse implements QueryResponse {
  constructor(public readonly scheduleBalanceAdjustment: ScheduledBalanceAdjustment) {}
}

export class GetScheduledBalanceAdjustmentQuery extends Query<GetScheduledBalanceAdjustmentQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly balanceAdjustmentId: number,
  ) {
    super();
  }
}
