// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetPaymentTokenDecimalsQueryResponse implements QueryResponse {
  constructor(public readonly payload: number) {}
}

export class GetPaymentTokenDecimalsQuery extends Query<GetPaymentTokenDecimalsQueryResponse> {
  constructor(public readonly lifeCycleCashFlowId: string) {
    super();
  }
}
