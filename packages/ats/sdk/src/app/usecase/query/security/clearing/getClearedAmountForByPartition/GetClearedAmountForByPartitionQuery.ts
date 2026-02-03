// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetClearedAmountForByPartitionQueryResponse implements QueryResponse {
  constructor(public readonly payload: number) {}
}

export class GetClearedAmountForByPartitionQuery extends Query<GetClearedAmountForByPartitionQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly partitionId: string,
    public readonly targetId: string,
  ) {
    super();
  }
}
