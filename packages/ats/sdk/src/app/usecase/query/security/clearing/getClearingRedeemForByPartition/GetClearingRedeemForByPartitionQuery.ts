// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";
import { ClearingRedeem } from "@domain/context/security/Clearing";

export class GetClearingRedeemForByPartitionQueryResponse implements QueryResponse {
  constructor(public readonly payload: ClearingRedeem) {}
}

export class GetClearingRedeemForByPartitionQuery extends Query<GetClearingRedeemForByPartitionQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly partitionId: string,
    public readonly targetId: string,
    public readonly clearingId: number,
  ) {
    super();
  }
}
