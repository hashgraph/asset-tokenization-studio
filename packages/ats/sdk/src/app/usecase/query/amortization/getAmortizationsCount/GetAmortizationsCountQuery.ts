// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetAmortizationsCountQueryResponse implements QueryResponse {
  constructor(public readonly payload: number) {}
}

export class GetAmortizationsCountQuery extends Query<GetAmortizationsCountQueryResponse> {
  constructor(public readonly securityId: string) {
    super();
  }
}
