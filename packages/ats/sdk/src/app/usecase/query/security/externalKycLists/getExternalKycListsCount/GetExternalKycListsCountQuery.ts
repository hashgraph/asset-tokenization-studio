// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetExternalKycListsCountQueryResponse implements QueryResponse {
  constructor(public readonly payload: number) {}
}

export class GetExternalKycListsCountQuery extends Query<GetExternalKycListsCountQueryResponse> {
  constructor(public readonly securityId: string) {
    super();
  }
}
