// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetIssuerListMembersQueryResponse implements QueryResponse {
  constructor(public readonly payload: string[]) {}
}

export class GetIssuerListMembersQuery extends Query<GetIssuerListMembersQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly start: number,
    public readonly end: number,
  ) {
    super();
  }
}
