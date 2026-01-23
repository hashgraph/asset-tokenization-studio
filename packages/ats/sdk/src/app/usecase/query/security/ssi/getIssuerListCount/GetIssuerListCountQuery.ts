// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetIssuerListCountQueryResponse implements QueryResponse {
  constructor(public readonly payload: number) {}
}

export class GetIssuerListCountQuery extends Query<GetIssuerListCountQueryResponse> {
  constructor(public readonly securityId: string) {
    super();
  }
}
