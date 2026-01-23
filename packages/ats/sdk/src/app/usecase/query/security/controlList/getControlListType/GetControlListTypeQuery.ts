// SPDX-License-Identifier: Apache-2.0

import { SecurityControlListType } from "@domain/context/security/SecurityControlListType";
import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";

export class GetControlListTypeQueryResponse implements QueryResponse {
  constructor(public readonly payload: SecurityControlListType) {}
}

export class GetControlListTypeQuery extends Query<GetControlListTypeQueryResponse> {
  constructor(public readonly securityId: string) {
    super();
  }
}
