// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";
import GetCorporateActionsResponse from "@port/in/response/corporateActions/GetCorporateActionsResponse";

export class GetCorporateActionsQueryResponse implements QueryResponse {
  constructor(public readonly payload: GetCorporateActionsResponse) {}
}

export class GetCorporateActionsQuery extends Query<GetCorporateActionsQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly pageIndex: number,
    public readonly pageLength: number,
  ) {
    super();
  }
}
