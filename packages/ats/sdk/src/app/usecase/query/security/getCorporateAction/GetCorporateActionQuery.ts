// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";
import GetCorporateActionResponse from "@port/in/response/corporateActions/GetCorporateActionResponse";

export class GetCorporateActionQueryResponse implements QueryResponse {
  constructor(public readonly payload: GetCorporateActionResponse) {}
}

export class GetCorporateActionQuery extends Query<GetCorporateActionQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly corporateActionId: string,
  ) {
    super();
  }
}
