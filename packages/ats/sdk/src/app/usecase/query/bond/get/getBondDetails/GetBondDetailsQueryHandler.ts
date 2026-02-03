// SPDX-License-Identifier: Apache-2.0

import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { GetBondDetailsQuery, GetBondDetailsQueryResponse } from "./GetBondDetailsQuery";
import AccountService from "@service/account/AccountService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { BondDetails } from "@domain/context/bond/BondDetails";
import { GetBondDetailsQueryError } from "./error/GetBondDetailsQueryError";

@QueryHandler(GetBondDetailsQuery)
export class GetBondDetailsQueryHandler implements IQueryHandler<GetBondDetailsQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
  ) {}

  async execute(query: GetBondDetailsQuery): Promise<GetBondDetailsQueryResponse> {
    try {
      const { bondId } = query;

      const bondEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(bondId);

      const bond: BondDetails = await this.queryAdapter.getBondDetails(bondEvmAddress);

      return Promise.resolve(new GetBondDetailsQueryResponse(bond));
    } catch (error) {
      throw new GetBondDetailsQueryError(error as Error);
    }
  }
}
