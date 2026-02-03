// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetVotingCountQueryResponse implements QueryResponse {
  constructor(public readonly payload: number) {}
}

export class GetVotingCountQuery extends Query<GetVotingCountQueryResponse> {
  constructor(public readonly securityId: string) {
    super();
  }
}
