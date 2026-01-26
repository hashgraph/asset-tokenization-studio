// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetRevocationRegistryAddressQueryResponse implements QueryResponse {
  constructor(public readonly payload: string) {}
}

export class GetRevocationRegistryAddressQuery extends Query<GetRevocationRegistryAddressQueryResponse> {
  constructor(public readonly securityId: string) {
    super();
  }
}
