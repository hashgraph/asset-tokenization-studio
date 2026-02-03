// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetClearedAmountForQueryResponse implements QueryResponse {
  constructor(public readonly payload: number) {}
}

export class GetClearedAmountForQuery extends Query<GetClearedAmountForQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly targetId: string,
  ) {
    super();
  }
}
