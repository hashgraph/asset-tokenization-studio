// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetRoleCountForQueryResponse implements QueryResponse {
  constructor(public readonly payload: number) {}
}

export class GetRoleCountForQuery extends Query<GetRoleCountForQueryResponse> {
  constructor(
    public readonly targetId: string,
    public readonly securityId: string,
  ) {
    super();
  }
}
