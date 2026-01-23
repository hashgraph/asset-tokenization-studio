// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetKycStatusMockQueryResponse implements QueryResponse {
  constructor(public readonly payload: number) {}
}

export class GetKycStatusMockQuery extends Query<GetKycStatusMockQueryResponse> {
  constructor(
    public readonly contractId: string,
    public readonly targetId: string,
  ) {
    super();
  }
}
