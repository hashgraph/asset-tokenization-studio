// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetTokenHoldersAtSnapshotQueryResponse implements QueryResponse {
  constructor(public readonly payload: string[]) {}
}

export class GetTokenHoldersAtSnapshotQuery extends Query<GetTokenHoldersAtSnapshotQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly snapshotId: number,
    public readonly start: number,
    public readonly end: number,
  ) {
    super();
  }
}
