// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";
import { Kyc } from "@domain/context/kyc/Kyc";

export class GetKycForQueryResponse implements QueryResponse {
  constructor(public readonly payload: Kyc) {}
}

export class GetKycForQuery extends Query<GetKycForQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly targetId: string,
  ) {
    super();
  }
}
