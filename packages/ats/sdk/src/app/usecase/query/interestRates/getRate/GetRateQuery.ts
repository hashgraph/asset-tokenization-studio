// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";
import { BigNumber } from "ethers";

export class GetRateQueryResponse implements QueryResponse {
  constructor(
    public readonly rate: BigNumber,
    public readonly decimals: number,
  ) {}
}

export class GetRateQuery extends Query<GetRateQueryResponse> {
  constructor(public readonly securityId: string) {
    super();
  }
}
