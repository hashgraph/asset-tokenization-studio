// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { CommandResponse } from "@core/command/CommandResponse";

export class GetCouponsOrderedListQueryResponse implements CommandResponse {
  constructor(public readonly payload: number[]) {}
}

export class GetCouponsOrderedListQuery extends Query<GetCouponsOrderedListQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly pageIndex: number,
    public readonly pageLength: number,
  ) {
    super();
  }
}
