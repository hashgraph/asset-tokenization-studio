// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetTotalTokenHoldersAtSnapshotQueryResponse implements QueryResponse {
  constructor(public readonly payload: number) {}
}

export class GetTotalTokenHoldersAtSnapshotQuery extends Query<GetTotalTokenHoldersAtSnapshotQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly snapshotId: number,
  ) {
    super();
  }
}
