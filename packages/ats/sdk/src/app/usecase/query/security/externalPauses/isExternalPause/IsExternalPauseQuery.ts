// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class IsExternalPauseQueryResponse implements QueryResponse {
  constructor(public readonly payload: boolean) {}
}

export class IsExternalPauseQuery extends Query<IsExternalPauseQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly externalPauseAddress: string,
  ) {
    super();
  }
}
