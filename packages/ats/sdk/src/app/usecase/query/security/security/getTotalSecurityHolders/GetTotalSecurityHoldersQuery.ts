// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetTotalSecurityHoldersQueryResponse implements QueryResponse {
  constructor(public readonly payload: number) {}
}

export class GetTotalSecurityHoldersQuery extends Query<GetTotalSecurityHoldersQueryResponse> {
  constructor(public readonly securityId: string) {
    super();
  }
}
