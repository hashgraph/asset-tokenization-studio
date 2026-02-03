// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetTotalDividendHoldersQueryResponse implements QueryResponse {
  constructor(public readonly payload: number) {}
}

export class GetTotalDividendHoldersQuery extends Query<GetTotalDividendHoldersQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly dividendId: number,
  ) {
    super();
  }
}
