// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";
import BigDecimal from "@domain/context/shared/BigDecimal";

export class GetNominalValueQueryResponse implements QueryResponse {
  constructor(public readonly payload: BigDecimal) {}
}

export class GetNominalValueQuery extends Query<GetNominalValueQueryResponse> {
  constructor(public readonly securityId: string) {
    super();
  }
}
