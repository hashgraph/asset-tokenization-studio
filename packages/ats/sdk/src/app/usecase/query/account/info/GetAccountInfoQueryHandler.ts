// SPDX-License-Identifier: Apache-2.0

import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import Injectable from "@core/injectable/Injectable";
import { IQueryHandler } from "@core/query/QueryHandler";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import { GetAccountInfoQueryError } from "./error/GetAccountInfoQueryError";
import { GetAccountInfoQuery, GetAccountInfoQueryResponse } from "./GetAccountInfoQuery";

@QueryHandler(GetAccountInfoQuery)
export class GetAccountInfoQueryHandler implements IQueryHandler<GetAccountInfoQuery> {
  constructor(private readonly repo: MirrorNodeAdapter = Injectable.resolve(MirrorNodeAdapter)) {}

  async execute(query: GetAccountInfoQuery): Promise<GetAccountInfoQueryResponse> {
    try {
      const res = await this.repo.getAccountInfo(query.id);
      return Promise.resolve(new GetAccountInfoQueryResponse(res));
    } catch (error) {
      throw new GetAccountInfoQueryError(error as Error);
    }
  }
}
