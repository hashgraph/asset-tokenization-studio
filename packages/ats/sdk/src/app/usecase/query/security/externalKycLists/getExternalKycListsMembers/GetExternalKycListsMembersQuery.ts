// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetExternalKycListsMembersQueryResponse implements QueryResponse {
  constructor(public readonly payload: string[]) {}
}

export class GetExternalKycListsMembersQuery extends Query<GetExternalKycListsMembersQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly start: number,
    public readonly end: number,
  ) {
    super();
  }
}
