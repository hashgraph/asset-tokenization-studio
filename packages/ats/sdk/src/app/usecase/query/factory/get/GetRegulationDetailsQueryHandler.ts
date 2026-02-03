// SPDX-License-Identifier: Apache-2.0

import EvmAddress from "@domain/context/contract/EvmAddress";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { GetRegulationDetailsQuery, GetRegulationDetailsQueryResponse } from "./GetRegulationDetailsQuery";
import { Regulation } from "@domain/context/factory/Regulation";
import AccountService from "@service/account/AccountService";
import { InvalidRequest } from "@command/error/InvalidRequest";
import { GetRegulationDetailsQueryError } from "./error/GetRegulationDetailsQueryError";

@QueryHandler(GetRegulationDetailsQuery)
export class GetRegulationDetailsQueryHandler implements IQueryHandler<GetRegulationDetailsQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
  ) {}

  async execute(query: GetRegulationDetailsQuery): Promise<GetRegulationDetailsQueryResponse> {
    try {
      const { type, subType, factory } = query;

      if (!factory) {
        throw new InvalidRequest("Factory not found in request");
      }

      const factoryEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(factory.toString());

      const regulation: Regulation = await this.queryAdapter.getRegulationDetails(type, subType, factoryEvmAddress);

      return Promise.resolve(new GetRegulationDetailsQueryResponse(regulation));
    } catch (error) {
      throw new GetRegulationDetailsQueryError(error as Error);
    }
  }
}
