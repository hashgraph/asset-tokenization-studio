// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class OnchainIDQueryResponse implements QueryResponse {
  constructor(public readonly payload: string) {}
}

export class OnchainIDQuery extends Query<OnchainIDQueryResponse> {
  constructor(public readonly securityId: string) {
    super();
  }
}
