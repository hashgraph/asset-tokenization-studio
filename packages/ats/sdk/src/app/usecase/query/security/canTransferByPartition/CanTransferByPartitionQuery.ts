// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class CanTransferByPartitionQueryResponse implements QueryResponse {
  constructor(public readonly payload: [string, string]) {}
}

export class CanTransferByPartitionQuery extends Query<CanTransferByPartitionQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly sourceId: string,
    public readonly targetId: string,
    public readonly partitionId: string,
    public readonly amount: string,
  ) {
    super();
  }
}
