// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class IsProceedRecipientQueryResponse implements QueryResponse {
  constructor(public readonly payload: boolean) {}
}

export class IsProceedRecipientQuery extends Query<IsProceedRecipientQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly targetId: string,
  ) {
    super();
  }
}
