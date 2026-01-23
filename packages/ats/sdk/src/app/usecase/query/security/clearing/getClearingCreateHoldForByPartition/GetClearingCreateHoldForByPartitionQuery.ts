// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";
import { ClearingHoldCreation } from "@domain/context/security/Clearing";

export class GetClearingCreateHoldForByPartitionQueryResponse implements QueryResponse {
  constructor(public readonly payload: ClearingHoldCreation) {}
}

export class GetClearingCreateHoldForByPartitionQuery extends Query<GetClearingCreateHoldForByPartitionQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly partitionId: string,
    public readonly targetId: string,
    public readonly clearingId: number,
  ) {
    super();
  }
}
