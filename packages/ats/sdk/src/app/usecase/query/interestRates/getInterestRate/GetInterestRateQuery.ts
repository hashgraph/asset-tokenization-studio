// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetInterestRateQueryResponse implements QueryResponse {
  constructor(
    public readonly maxRate: string,
    public readonly baseRate: string,
    public readonly minRate: string,
    public readonly startPeriod: string,
    public readonly startRate: string,
    public readonly missedPenalty: string,
    public readonly reportPeriod: string,
    public readonly rateDecimals: number,
  ) {}
}

export class GetInterestRateQuery extends Query<GetInterestRateQueryResponse> {
  constructor(public readonly securityId: string) {
    super();
  }
}
