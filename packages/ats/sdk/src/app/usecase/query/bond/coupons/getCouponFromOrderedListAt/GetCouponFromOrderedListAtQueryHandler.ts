// SPDX-License-Identifier: Apache-2.0

import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { GetCouponFromOrderedListAtQueryError } from "./error/GetCouponFromOrderedListAtQueryError";
import {
  GetCouponFromOrderedListAtQuery,
  GetCouponFromOrderedListAtQueryResponse,
} from "./GetCouponFromOrderedListAtQuery";
import EvmAddress from "@domain/context/contract/EvmAddress";
import AccountService from "@service/account/AccountService";

@QueryHandler(GetCouponFromOrderedListAtQuery)
export class GetCouponFromOrderedListAtQueryHandler implements IQueryHandler<GetCouponFromOrderedListAtQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
  ) {}

  async execute(query: GetCouponFromOrderedListAtQuery): Promise<GetCouponFromOrderedListAtQueryResponse> {
    try {
      const { securityId, pos } = query;

      const securityEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(securityId);

      const res = await this.queryAdapter.getCouponFromOrderedListAt(securityEvmAddress, pos);

      return new GetCouponFromOrderedListAtQueryResponse(res);
    } catch (error) {
      throw new GetCouponFromOrderedListAtQueryError(error as Error);
    }
  }
}
