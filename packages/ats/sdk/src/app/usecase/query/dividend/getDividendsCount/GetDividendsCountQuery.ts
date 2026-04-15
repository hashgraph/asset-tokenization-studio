// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetDividendsCountQueryResponse implements QueryResponse {
  constructor(public readonly payload: number) {}
}

export class GetDividendsCountQuery extends Query<GetDividendsCountQueryResponse> {
  constructor(public readonly securityId: string) {
    super();
  }
}
