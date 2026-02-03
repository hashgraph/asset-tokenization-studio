// SPDX-License-Identifier: Apache-2.0

import { QueryResponse } from "@core/query/QueryResponse";
import { Query } from "@core/query/Query";
import { DiamondConfiguration } from "@domain/context/security/DiamondConfiguration";

export class GetConfigInfoQueryResponse implements QueryResponse {
  constructor(public readonly payload: DiamondConfiguration) {}
}

export class GetConfigInfoQuery extends Query<GetConfigInfoQueryResponse> {
  constructor(public readonly securityId: string) {
    super();
  }
}
