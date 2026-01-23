// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";
import BigDecimal from "@domain/context/shared/BigDecimal";

export class GetVotingForQueryResponse implements QueryResponse {
  constructor(
    public readonly tokenBalance: BigDecimal,
    public readonly decimals: number,
  ) {}
}

export class GetVotingForQuery extends Query<GetVotingForQueryResponse> {
  constructor(
    public readonly targetId: string,
    public readonly securityId: string,
    public readonly votingId: number,
  ) {
    super();
  }
}
