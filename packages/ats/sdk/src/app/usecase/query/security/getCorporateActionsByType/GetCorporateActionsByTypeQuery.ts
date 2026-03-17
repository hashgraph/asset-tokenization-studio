// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";
import GetCorporateActionsResponse from "@port/in/response/corporateActions/GetCorporateActionsResponse";

export class GetCorporateActionsByTypeQueryResponse implements QueryResponse {
  constructor(public readonly payload: GetCorporateActionsResponse) {}
}

export class GetCorporateActionsByTypeQuery extends Query<GetCorporateActionsByTypeQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly actionType: string,
    public readonly start: number,
    public readonly end: number,
  ) {
    super();
  }
}
