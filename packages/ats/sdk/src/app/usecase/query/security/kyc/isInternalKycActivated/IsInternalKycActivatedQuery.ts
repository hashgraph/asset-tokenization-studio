// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class IsInternalKycActivatedQueryResponse implements QueryResponse {
  constructor(public readonly payload: boolean) {}
}

export class IsInternalKycActivatedQuery extends Query<IsInternalKycActivatedQueryResponse> {
  constructor(public readonly securityId: string) {
    super();
  }
}
