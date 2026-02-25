// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetCouponsOrderedListTotalQueryResponse implements QueryResponse {
  constructor(public readonly payload: number) {}
}

export class GetCouponsOrderedListTotalQuery extends Query<GetCouponsOrderedListTotalQueryResponse> {
  constructor(public readonly securityId: string) {
    super();
  }
}
