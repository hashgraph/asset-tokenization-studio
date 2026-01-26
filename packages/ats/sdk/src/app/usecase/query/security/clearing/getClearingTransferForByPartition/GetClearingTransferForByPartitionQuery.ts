// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";
import { ClearingTransfer } from "@domain/context/security/Clearing";

export class GetClearingTransferForByPartitionQueryResponse implements QueryResponse {
  constructor(public readonly payload: ClearingTransfer) {}
}

export class GetClearingTransferForByPartitionQuery extends Query<GetClearingTransferForByPartitionQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly partitionId: string,
    public readonly targetId: string,
    public readonly clearingId: number,
  ) {
    super();
  }
}
