// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";
import { VotingRights } from "@domain/context/equity/VotingRights";

export class GetVotingQueryResponse implements QueryResponse {
  constructor(public readonly voting: VotingRights) {}
}

export class GetVotingQuery extends Query<GetVotingQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly votingId: number,
  ) {
    super();
  }
}
