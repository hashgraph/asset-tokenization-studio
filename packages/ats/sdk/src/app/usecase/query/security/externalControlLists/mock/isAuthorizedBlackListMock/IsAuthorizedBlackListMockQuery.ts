// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class IsAuthorizedBlackListMockQueryResponse implements QueryResponse {
  constructor(public readonly payload: boolean) {}
}

export class IsAuthorizedBlackListMockQuery extends Query<IsAuthorizedBlackListMockQueryResponse> {
  constructor(
    public readonly contractId: string,
    public readonly targetId: string,
  ) {
    super();
  }
}
