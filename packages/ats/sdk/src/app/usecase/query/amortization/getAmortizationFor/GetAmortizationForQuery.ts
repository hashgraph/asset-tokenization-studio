// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";
import { AmortizationFor } from "@domain/context/amortization/AmortizationFor";

export class GetAmortizationForQueryResponse implements QueryResponse {
  constructor(public readonly amortizationFor: AmortizationFor) {}
}

export class GetAmortizationForQuery extends Query<GetAmortizationForQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly targetId: string,
    public readonly amortizationId: number,
  ) {
    super();
  }
}
