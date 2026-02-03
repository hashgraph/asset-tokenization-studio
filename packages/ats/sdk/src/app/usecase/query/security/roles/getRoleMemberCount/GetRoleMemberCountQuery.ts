// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetRoleMemberCountQueryResponse implements QueryResponse {
  constructor(public readonly payload: number) {}
}

export class GetRoleMemberCountQuery extends Query<GetRoleMemberCountQueryResponse> {
  constructor(
    public readonly role: string,
    public readonly securityId: string,
  ) {
    super();
  }
}
