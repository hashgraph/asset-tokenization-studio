// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetKycStatusForQueryResponse implements QueryResponse {
  constructor(public readonly payload: number) {}
}

export class GetKycStatusForQuery extends Query<GetKycStatusForQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly targetId: string,
  ) {
    super();
  }
}
