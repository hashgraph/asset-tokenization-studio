// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class LocksIdQueryResponse implements QueryResponse {
  constructor(public readonly payload: bigint[]) {}
}

export class LocksIdQuery extends Query<LocksIdQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly targetId: string,
    public readonly start: number,
    public readonly end: number,
  ) {
    super();
  }
}
