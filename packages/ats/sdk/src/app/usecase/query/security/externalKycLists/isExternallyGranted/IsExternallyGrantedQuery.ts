// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class IsExternallyGrantedQueryResponse implements QueryResponse {
  constructor(public readonly payload: boolean) {}
}

export class IsExternallyGrantedQuery extends Query<IsExternallyGrantedQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly kycStatus: number,
    public readonly targetId: string,
  ) {
    super();
  }
}
