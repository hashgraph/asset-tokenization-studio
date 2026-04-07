// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetTotalAmortizationHoldersQueryResponse implements QueryResponse {
  constructor(public readonly payload: number) {}
}

export class GetTotalAmortizationHoldersQuery extends Query<GetTotalAmortizationHoldersQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly amortizationId: number,
  ) {
    super();
  }
}
