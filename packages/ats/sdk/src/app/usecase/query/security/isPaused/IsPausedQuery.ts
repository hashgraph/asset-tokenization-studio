// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class IsPausedQueryResponse implements QueryResponse {
  constructor(public readonly payload: boolean) {}
}

export class IsPausedQuery extends Query<IsPausedQueryResponse> {
  constructor(public readonly securityId: string) {
    super();
  }
}
