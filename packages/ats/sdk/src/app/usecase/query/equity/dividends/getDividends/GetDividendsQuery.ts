// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";
import { Dividend } from "@domain/context/equity/Dividend";

export class GetDividendsQueryResponse implements QueryResponse {
  constructor(public readonly dividend: Dividend) {}
}

export class GetDividendsQuery extends Query<GetDividendsQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly dividendId: number,
  ) {
    super();
  }
}
