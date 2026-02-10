// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { CommandResponse } from "@core/command/CommandResponse";

export class GetCouponsOrderedListTotalQueryResponse implements CommandResponse {
  constructor(public readonly payload: number) {}
}

export class GetCouponsOrderedListTotalQuery extends Query<GetCouponsOrderedListTotalQueryResponse> {
  constructor(public readonly securityId: string) {
    super();
  }
}
