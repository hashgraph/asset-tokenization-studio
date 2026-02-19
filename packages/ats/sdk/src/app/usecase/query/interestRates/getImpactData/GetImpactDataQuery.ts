// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetImpactDataQueryResponse implements QueryResponse {
  constructor(
    public readonly maxDeviationCap: string,
    public readonly baseLine: string,
    public readonly maxDeviationFloor: string,
    public readonly impactDataDecimals: number,
    public readonly adjustmentPrecision: string,
  ) {}
}

export class GetImpactDataQuery extends Query<GetImpactDataQueryResponse> {
  constructor(public readonly securityId: string) {
    super();
  }
}
