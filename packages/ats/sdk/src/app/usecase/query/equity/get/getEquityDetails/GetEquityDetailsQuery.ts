// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";
import { EquityDetails } from "@domain/context/equity/EquityDetails";

export class GetEquityDetailsQueryResponse implements QueryResponse {
  constructor(public readonly equity: EquityDetails) {}
}

export class GetEquityDetailsQuery extends Query<GetEquityDetailsQueryResponse> {
  constructor(public readonly equityId: string) {
    super();
  }
}
