// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class ComplianceQueryResponse implements QueryResponse {
  constructor(public readonly payload: string) {}
}

export class ComplianceQuery extends Query<ComplianceQueryResponse> {
  constructor(public readonly securityId: string) {
    super();
  }
}
