// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetActiveAmortizationIdsQueryResponse implements QueryResponse {
  constructor(public readonly payload: number[]) {}
}

export class GetActiveAmortizationIdsQuery extends Query<GetActiveAmortizationIdsQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly start: number,
    public readonly end: number,
  ) {
    super();
  }
}
