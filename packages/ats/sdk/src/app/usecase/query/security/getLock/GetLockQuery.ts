// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";
import { Lock } from "@domain/context/security/Lock";

export class GetLockQueryResponse implements QueryResponse {
  constructor(public readonly payload: Lock) {}
}

export class GetLockQuery extends Query<GetLockQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly targetId: string,
    public readonly id: number,
  ) {
    super();
  }
}
