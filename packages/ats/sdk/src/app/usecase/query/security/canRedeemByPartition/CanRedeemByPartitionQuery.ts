// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class CanRedeemByPartitionQueryResponse implements QueryResponse {
  constructor(public readonly payload: [string, string]) {}
}

export class CanRedeemByPartitionQuery extends Query<CanRedeemByPartitionQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly sourceId: string,
    public readonly partitionId: string,
    public readonly amount: string,
  ) {
    super();
  }
}
