// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";
import { BondDetails } from "@domain/context/bond/BondDetails";

export class GetBondDetailsQueryResponse implements QueryResponse {
  constructor(public readonly bond: BondDetails) {}
}

export class GetBondDetailsQuery extends Query<GetBondDetailsQueryResponse> {
  constructor(public readonly bondId: string) {
    super();
  }
}
