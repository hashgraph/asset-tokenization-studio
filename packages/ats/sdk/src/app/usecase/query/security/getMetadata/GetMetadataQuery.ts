// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetMetadataQueryResponse implements QueryResponse {
  constructor(public readonly value: string[]) {}
}

export class GetMetadataQuery extends Query<GetMetadataQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly key: string,
  ) {
    super();
  }
}
