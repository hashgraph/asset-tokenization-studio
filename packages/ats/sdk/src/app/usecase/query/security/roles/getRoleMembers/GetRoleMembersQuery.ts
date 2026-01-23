// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetRoleMembersQueryResponse implements QueryResponse {
  constructor(public readonly payload: string[]) {}
}

export class GetRoleMembersQuery extends Query<GetRoleMembersQueryResponse> {
  constructor(
    public readonly role: string,
    public readonly securityId: string,
    public readonly start: number,
    public readonly end: number,
  ) {
    super();
  }
}
