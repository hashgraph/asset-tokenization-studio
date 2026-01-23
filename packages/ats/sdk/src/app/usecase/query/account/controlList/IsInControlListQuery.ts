// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class IsInControlListQueryResponse implements QueryResponse {
  constructor(public readonly payload: boolean) {}
}

export class IsInControlListQuery extends Query<IsInControlListQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly targetId: string,
  ) {
    super();
  }
}
