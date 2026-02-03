// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";
import { Security } from "@domain/context/security/Security";

export class GetSecurityQueryResponse implements QueryResponse {
  constructor(public readonly security: Security) {}
}

export class GetSecurityQuery extends Query<GetSecurityQueryResponse> {
  constructor(public readonly securityId: string) {
    super();
  }
}
