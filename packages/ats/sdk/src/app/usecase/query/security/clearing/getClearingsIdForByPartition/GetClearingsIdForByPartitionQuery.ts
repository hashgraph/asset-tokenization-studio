// SPDX-License-Identifier: Apache-2.0

import { ClearingOperationType } from "@domain/context/security/Clearing";
import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetClearingsIdForByPartitionQueryResponse implements QueryResponse {
  constructor(public readonly payload: number[]) {}
}

export class GetClearingsIdForByPartitionQuery extends Query<GetClearingsIdForByPartitionQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly partitionId: string,
    public readonly targetId: string,
    public readonly clearingOperationType: ClearingOperationType,
    public readonly start: number,
    public readonly end: number,
  ) {
    super();
  }
}
