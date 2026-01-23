// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetVotingHoldersQueryResponse implements QueryResponse {
  constructor(public readonly payload: string[]) {}
}

export class GetVotingHoldersQuery extends Query<GetVotingHoldersQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly voteId: number,
    public readonly start: number,
    public readonly end: number,
  ) {
    super();
  }
}
