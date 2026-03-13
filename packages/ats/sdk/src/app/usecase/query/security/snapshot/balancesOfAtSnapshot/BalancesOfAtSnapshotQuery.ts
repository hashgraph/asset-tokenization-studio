// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export interface HolderBalance {
  holder: string;
  balance: bigint;
}

export class BalancesOfAtSnapshotQueryResponse implements QueryResponse {
  constructor(public readonly payload: HolderBalance[]) {}
}

export class BalancesOfAtSnapshotQuery extends Query<BalancesOfAtSnapshotQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly snapshotId: number,
    public readonly pageIndex: number,
    public readonly pageLength: number,
  ) {
    super();
  }
}
