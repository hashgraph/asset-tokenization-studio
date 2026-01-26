// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class IsIssuerQueryResponse implements QueryResponse {
  constructor(public readonly payload: boolean) {}
}

export class IsIssuerQuery extends Query<IsIssuerQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly issuerId: string,
  ) {
    super();
  }
}
