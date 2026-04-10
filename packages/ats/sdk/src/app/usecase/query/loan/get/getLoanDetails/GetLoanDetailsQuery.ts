// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";
import { LoanDetails } from "@domain/context/loan/LoanDetails";

export class GetLoanDetailsQueryResponse implements QueryResponse {
  constructor(public readonly loan: LoanDetails) {}
}

export class GetLoanDetailsQuery extends Query<GetLoanDetailsQueryResponse> {
  constructor(public readonly loanId: string) {
    super();
  }
}
