// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetExternalControlListsCountQueryResponse implements QueryResponse {
  constructor(public readonly payload: number) {}
}

export class GetExternalControlListsCountQuery extends Query<GetExternalControlListsCountQueryResponse> {
  constructor(public readonly securityId: string) {
    super();
  }
}
