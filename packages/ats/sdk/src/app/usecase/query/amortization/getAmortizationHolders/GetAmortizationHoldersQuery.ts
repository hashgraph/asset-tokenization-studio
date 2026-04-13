// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetAmortizationHoldersQueryResponse implements QueryResponse {
  constructor(public readonly payload: string[]) {}
}

export class GetAmortizationHoldersQuery extends Query<GetAmortizationHoldersQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly amortizationId: number,
    public readonly start: number,
    public readonly end: number,
  ) {
    super();
  }
}
