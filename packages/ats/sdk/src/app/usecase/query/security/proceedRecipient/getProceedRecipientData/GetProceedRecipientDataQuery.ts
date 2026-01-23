// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetProceedRecipientDataQueryResponse implements QueryResponse {
  constructor(public readonly payload: string) {}
}

export class GetProceedRecipientDataQuery extends Query<GetProceedRecipientDataQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly targetId: string,
  ) {
    super();
  }
}
