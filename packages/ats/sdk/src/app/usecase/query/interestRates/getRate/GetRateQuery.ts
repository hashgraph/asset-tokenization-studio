// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetRateQueryResponse implements QueryResponse {
  constructor(
    public readonly rate: string,
    public readonly decimals: number,
  ) {}
}

export class GetRateQuery extends Query<GetRateQueryResponse> {
  constructor(public readonly securityId: string) {
    super();
  }
}
