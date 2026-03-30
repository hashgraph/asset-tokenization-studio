// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetDividendHoldersQueryResponse implements QueryResponse {
  constructor(public readonly payload: string[]) {}
}

export class GetDividendHoldersQuery extends Query<GetDividendHoldersQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly dividendId: number,
    public readonly start: number,
    public readonly end: number,
  ) {
    super();
  }
}
