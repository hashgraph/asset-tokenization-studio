// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class IsExternalControlListQueryResponse implements QueryResponse {
  constructor(public readonly payload: boolean) {}
}

export class IsExternalControlListQuery extends Query<IsExternalControlListQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly externalControlListAddress: string,
  ) {
    super();
  }
}
