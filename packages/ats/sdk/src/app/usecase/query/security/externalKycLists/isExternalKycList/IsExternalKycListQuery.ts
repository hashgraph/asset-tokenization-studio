// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class IsExternalKycListQueryResponse implements QueryResponse {
  constructor(public readonly payload: boolean) {}
}

export class IsExternalKycListQuery extends Query<IsExternalKycListQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly externalKycListAddress: string,
  ) {
    super();
  }
}
