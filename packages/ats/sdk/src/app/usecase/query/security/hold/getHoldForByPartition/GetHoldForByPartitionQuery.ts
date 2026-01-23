// SPDX-License-Identifier: Apache-2.0

import { HoldDetails } from "@domain/context/security/Hold";
import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetHoldForByPartitionQueryResponse implements QueryResponse {
  constructor(public readonly payload: HoldDetails) {}
}

export class GetHoldForByPartitionQuery extends Query<GetHoldForByPartitionQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly partitionId: string,
    public readonly targetId: string,
    public readonly holdId: number,
  ) {
    super();
  }
}
