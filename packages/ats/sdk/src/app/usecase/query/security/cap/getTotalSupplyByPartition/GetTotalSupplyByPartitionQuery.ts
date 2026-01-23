// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";
import BigDecimal from "@domain/context/shared/BigDecimal";

export class GetTotalSupplyByPartitionQueryResponse implements QueryResponse {
  constructor(public readonly payload: BigDecimal) {}
}

export class GetTotalSupplyByPartitionQuery extends Query<GetTotalSupplyByPartitionQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly partitionId: string,
  ) {
    super();
  }
}
