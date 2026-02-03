// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetProceedRecipientsQueryResponse implements QueryResponse {
  constructor(public readonly payload: string[]) {}
}

export class GetProceedRecipientsQuery extends Query<GetProceedRecipientsQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly pageIndex: number,
    public readonly pageSize: number,
  ) {
    super();
  }
}
