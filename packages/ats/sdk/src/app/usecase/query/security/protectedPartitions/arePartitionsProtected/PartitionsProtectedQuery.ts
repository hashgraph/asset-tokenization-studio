// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class PartitionsProtectedQueryResponse implements QueryResponse {
  constructor(public readonly payload: boolean) {}
}

export class PartitionsProtectedQuery extends Query<PartitionsProtectedQueryResponse> {
  constructor(public readonly securityId: string) {
    super();
  }
}
