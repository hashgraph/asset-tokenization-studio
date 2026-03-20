// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";
import { Dividend } from "@domain/context/dividend/Dividend";

export class GetDividendQueryResponse implements QueryResponse {
  constructor(public readonly dividend: Dividend) {}
}

export class GetDividendQuery extends Query<GetDividendQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly dividendId: number,
  ) {
    super();
  }
}
