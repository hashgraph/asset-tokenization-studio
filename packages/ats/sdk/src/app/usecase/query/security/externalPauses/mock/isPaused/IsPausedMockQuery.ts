// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class IsPausedMockQueryResponse implements QueryResponse {
  constructor(public readonly payload: boolean) {}
}

export class IsPausedMockQuery extends Query<IsPausedMockQueryResponse> {
  constructor(public readonly contractId: string) {
    super();
  }
}
