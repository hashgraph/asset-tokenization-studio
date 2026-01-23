// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class CanTransferQueryResponse implements QueryResponse {
  constructor(public readonly payload: string) {}
}

export class CanTransferQuery extends Query<CanTransferQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly targetId: string,
    public readonly amount: string,
  ) {
    super();
  }
}
