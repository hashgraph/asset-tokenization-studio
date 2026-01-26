// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetTokenBySaltQueryResponse implements QueryResponse {
  constructor(public readonly token: string) {}
}

export class GetTokenBySaltQuery extends Query<GetTokenBySaltQueryResponse> {
  constructor(
    public readonly factory: string,
    public readonly salt: string,
  ) {
    super();
  }
}
