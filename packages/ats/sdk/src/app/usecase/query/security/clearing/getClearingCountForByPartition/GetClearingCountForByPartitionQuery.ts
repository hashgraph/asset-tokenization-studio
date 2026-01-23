// SPDX-License-Identifier: Apache-2.0

import { ClearingOperationType } from "@domain/context/security/Clearing";
import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetClearingCountForByPartitionQueryResponse implements QueryResponse {
  constructor(public readonly payload: number) {}
}

export class GetClearingCountForByPartitionQuery extends Query<GetClearingCountForByPartitionQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly partitionId: string,
    public readonly targetId: string,
    public readonly clearingOperationType: ClearingOperationType,
  ) {
    super();
  }
}
