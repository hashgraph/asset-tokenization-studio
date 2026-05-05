// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetPendingBalanceAdjustmentCountQueryResponse implements QueryResponse {
  constructor(public readonly payload: number) {}
}

export class GetPendingBalanceAdjustmentCountQuery extends Query<GetPendingBalanceAdjustmentCountQueryResponse> {
  constructor(public readonly securityId: string) {
    super();
  }
}
