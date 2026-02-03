// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class HasRoleQueryResponse implements QueryResponse {
  constructor(public readonly payload: boolean) {}
}

export class HasRoleQuery extends Query<HasRoleQueryResponse> {
  constructor(
    public readonly role: string,
    public readonly targetId: string,
    public readonly securityId: string,
  ) {
    super();
  }
}
