// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetLatestKpiDataQueryResponse implements QueryResponse {
  constructor(
    public readonly value: string,
    public readonly exists: boolean,
  ) {}
}

export class GetLatestKpiDataQuery extends Query<GetLatestKpiDataQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly from: bigint,
    public readonly to: bigint,
    public readonly kpi: string,
  ) {
    super();
  }
}
