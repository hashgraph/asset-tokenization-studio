// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class ActionContentHashExistsQueryResponse implements QueryResponse {
  constructor(public readonly payload: boolean) {}
}

export class ActionContentHashExistsQuery extends Query<ActionContentHashExistsQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly contentHash: string,
  ) {
    super();
  }
}
