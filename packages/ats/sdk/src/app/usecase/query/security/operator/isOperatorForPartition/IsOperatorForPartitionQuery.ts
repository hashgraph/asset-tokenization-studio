// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class IsOperatorForPartitionQueryResponse implements QueryResponse {
  constructor(public readonly payload: boolean) {}
}

export class IsOperatorForPartitionQuery extends Query<IsOperatorForPartitionQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly partitionId: string,
    public readonly operatorId: string,
    public readonly targetId: string,
  ) {
    super();
  }
}
