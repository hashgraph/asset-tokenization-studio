// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetMinDateQueryResponse implements QueryResponse {
  constructor(public readonly minDate: number) {}
}

export class GetMinDateQuery extends Query<GetMinDateQueryResponse> {
  constructor(public readonly securityId: string) {
    super();
  }
}
