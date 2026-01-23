// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";
import { KycAccountData } from "@domain/context/kyc/KycAccountData";

export class GetKycAccountsDataQueryResponse implements QueryResponse {
  constructor(public readonly payload: KycAccountData[]) {}
}

export class GetKycAccountsDataQuery extends Query<GetKycAccountsDataQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly kycStatus: number,
    public readonly start: number,
    public readonly end: number,
  ) {
    super();
  }
}
