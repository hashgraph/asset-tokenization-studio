// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class IsOperatorQueryResponse implements QueryResponse {
  constructor(public readonly payload: boolean) {}
}

export class IsOperatorQuery extends Query<IsOperatorQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly operatorId: string,
    public readonly targetId: string,
  ) {
    super();
  }
}
