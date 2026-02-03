// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetProceedRecipientsCountQueryResponse implements QueryResponse {
  constructor(public readonly payload: number) {}
}

export class GetProceedRecipientsCountQuery extends Query<GetProceedRecipientsCountQueryResponse> {
  constructor(public readonly securityId: string) {
    super();
  }
}
