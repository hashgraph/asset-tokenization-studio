// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetSecurityHoldersQueryResponse implements QueryResponse {
  constructor(public readonly payload: string[]) {}
}

export class GetSecurityHoldersQuery extends Query<GetSecurityHoldersQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly start: number,
    public readonly end: number,
  ) {
    super();
  }
}
