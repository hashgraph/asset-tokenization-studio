// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";
import { AmortizationPaymentAmount } from "@domain/context/amortization/AmortizationPaymentAmount";

export class GetAmortizationPaymentAmountQueryResponse implements QueryResponse {
  constructor(public readonly amortizationPaymentAmount: AmortizationPaymentAmount) {}
}

export class GetAmortizationPaymentAmountQuery extends Query<GetAmortizationPaymentAmountQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly amortizationId: number,
    public readonly tokenHolder: string,
  ) {
    super();
  }
}
