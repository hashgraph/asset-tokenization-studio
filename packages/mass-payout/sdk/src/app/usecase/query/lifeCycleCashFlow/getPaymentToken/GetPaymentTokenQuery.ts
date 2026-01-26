// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetPaymentTokenQueryResponse implements QueryResponse {
  constructor(public readonly payload: string) {}
}

export class GetPaymentTokenQuery extends Query<GetPaymentTokenQueryResponse> {
  constructor(public readonly lifeCycleCashFlowId: string) {
    super();
  }
}
