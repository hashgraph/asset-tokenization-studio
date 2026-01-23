// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetControlListCountQueryResponse implements QueryResponse {
  constructor(public readonly payload: number) {}
}

export class GetControlListCountQuery extends Query<GetControlListCountQueryResponse> {
  constructor(public readonly securityId: string) {
    super();
  }
}
