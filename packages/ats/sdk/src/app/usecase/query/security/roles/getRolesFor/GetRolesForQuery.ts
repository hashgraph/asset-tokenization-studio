// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetRolesForQueryResponse implements QueryResponse {
  constructor(public readonly payload: string[]) {}
}

export class GetRolesForQuery extends Query<GetRolesForQueryResponse> {
  constructor(
    public readonly targetId: string,
    public readonly securityId: string,
    public readonly start: number,
    public readonly end: number,
  ) {
    super();
  }
}
