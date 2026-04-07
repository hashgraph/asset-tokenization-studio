// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetTotalActiveAmortizationHoldHoldersQueryResponse implements QueryResponse {
  constructor(public readonly payload: number) {}
}

export class GetTotalActiveAmortizationHoldHoldersQuery extends Query<GetTotalActiveAmortizationHoldHoldersQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly amortizationId: number,
  ) {
    super();
  }
}
