// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";
import { AmortizationFor } from "@domain/context/amortization/AmortizationFor";

export class GetAmortizationsForQueryResponse implements QueryResponse {
  constructor(public readonly payload: AmortizationFor[]) {}
}

export class GetAmortizationsForQuery extends Query<GetAmortizationsForQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly amortizationId: number,
    public readonly start: number,
    public readonly end: number,
  ) {
    super();
  }
}
