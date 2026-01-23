// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class IsClearingActivatedQueryResponse implements QueryResponse {
  constructor(public readonly payload: boolean) {}
}

export class IsClearingActivatedQuery extends Query<IsClearingActivatedQueryResponse> {
  constructor(public readonly securityId: string) {
    super();
  }
}
