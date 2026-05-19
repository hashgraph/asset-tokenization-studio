// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class IsDeactivatedQueryResponse implements QueryResponse {
  constructor(public readonly payload: boolean) {}
}

export class IsDeactivatedQuery extends Query<IsDeactivatedQueryResponse> {
  constructor(public readonly securityId: string) {
    super();
  }
}
