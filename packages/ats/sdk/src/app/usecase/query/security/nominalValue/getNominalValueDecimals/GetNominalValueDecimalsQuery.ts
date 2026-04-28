// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetNominalValueDecimalsQueryResponse implements QueryResponse {
  constructor(public readonly payload: number) {}
}

export class GetNominalValueDecimalsQuery extends Query<GetNominalValueDecimalsQueryResponse> {
  constructor(public readonly securityId: string) {
    super();
  }
}
