// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetHoldsIdForByPartitionQueryResponse implements QueryResponse {
  constructor(public readonly payload: number[]) {}
}

export class GetHoldsIdForByPartitionQuery extends Query<GetHoldsIdForByPartitionQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly partitionId: string,
    public readonly targetId: string,
    public readonly start: number,
    public readonly end: number,
  ) {
    super();
  }
}
