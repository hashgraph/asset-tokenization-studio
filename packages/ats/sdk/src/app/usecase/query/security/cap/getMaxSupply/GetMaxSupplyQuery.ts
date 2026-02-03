// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";
import BigDecimal from "@domain/context/shared/BigDecimal";

export class GetMaxSupplyQueryResponse implements QueryResponse {
  constructor(public readonly payload: BigDecimal) {}
}

export class GetMaxSupplyQuery extends Query<GetMaxSupplyQueryResponse> {
  constructor(public readonly securityId: string) {
    super();
  }
}
