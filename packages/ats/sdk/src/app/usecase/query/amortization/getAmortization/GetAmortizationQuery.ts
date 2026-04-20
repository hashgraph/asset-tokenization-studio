// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";
import { RegisteredAmortization } from "@domain/context/amortization/RegisteredAmortization";

export class GetAmortizationQueryResponse implements QueryResponse {
  constructor(public readonly amortization: RegisteredAmortization) {}
}

export class GetAmortizationQuery extends Query<GetAmortizationQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly amortizationId: number,
  ) {
    super();
  }
}
