// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetNominalValueCurrencyQueryResponse implements QueryResponse {
  constructor(public readonly payload: string) {}
}

export class GetNominalValueCurrencyQuery extends Query<GetNominalValueCurrencyQueryResponse> {
  constructor(public readonly securityId: string) {
    super();
  }
}
