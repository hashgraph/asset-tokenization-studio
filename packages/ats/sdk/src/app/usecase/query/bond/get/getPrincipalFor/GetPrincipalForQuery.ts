// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetPrincipalForQueryResponse implements QueryResponse {
  constructor(
    public readonly numerator: string,
    public readonly denominator: string,
  ) {}
}

export class GetPrincipalForQuery extends Query<GetPrincipalForQueryResponse> {
  constructor(
    public readonly targetId: string,
    public readonly securityId: string,
  ) {
    super();
  }
}
