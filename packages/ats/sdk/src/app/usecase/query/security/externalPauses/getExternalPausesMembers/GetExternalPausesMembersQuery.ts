// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetExternalPausesMembersQueryResponse implements QueryResponse {
  constructor(public readonly payload: string[]) {}
}

export class GetExternalPausesMembersQuery extends Query<GetExternalPausesMembersQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly start: number,
    public readonly end: number,
  ) {
    super();
  }
}
