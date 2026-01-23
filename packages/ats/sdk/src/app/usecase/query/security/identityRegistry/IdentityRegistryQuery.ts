// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class IdentityRegistryQueryResponse implements QueryResponse {
  constructor(public readonly payload: string) {}
}

export class IdentityRegistryQuery extends Query<IdentityRegistryQueryResponse> {
  constructor(public readonly securityId: string) {
    super();
  }
}
