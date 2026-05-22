// SPDX-License-Identifier: Apache-2.0

import { QueryResponse } from "@core/query/QueryResponse";
import { Query } from "@core/query/Query";

export class ResolveLatestConfigVersionQueryResponse implements QueryResponse {
  constructor(public readonly payload: number) {}
}

export class ResolveLatestConfigVersionQuery extends Query<ResolveLatestConfigVersionQueryResponse> {
  constructor(
    public readonly resolverAddress: string,
    public readonly configurationId: string,
  ) {
    super();
  }
}
