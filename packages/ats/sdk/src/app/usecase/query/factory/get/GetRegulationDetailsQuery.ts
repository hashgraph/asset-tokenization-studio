// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";
import { Regulation } from "@domain/context/factory/Regulation";
import ContractId from "@domain/context/contract/ContractId";

export class GetRegulationDetailsQueryResponse implements QueryResponse {
  constructor(public readonly regulation: Regulation) {}
}

export class GetRegulationDetailsQuery extends Query<GetRegulationDetailsQueryResponse> {
  constructor(
    public readonly type: number,
    public readonly subType: number,
    public readonly factory?: ContractId,
  ) {
    super();
  }
}
