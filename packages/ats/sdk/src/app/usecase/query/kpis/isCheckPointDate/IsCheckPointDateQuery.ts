// SPDX-License-Identifier: Apache-2.0

import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";
import { BigNumber } from "ethers";

export class IsCheckPointDateQueryResponse implements QueryResponse {
  constructor(public readonly isCheckPoint: boolean) {}
}

export class IsCheckPointDateQuery extends Query<IsCheckPointDateQueryResponse> {
  constructor(
    public readonly securityId: string,
    public readonly date: BigNumber,
    public readonly project: string,
  ) {
    super();
  }
}
