// SPDX-License-Identifier: Apache-2.0

import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import {
  ScheduledCouponListingCountQuery,
  ScheduledCouponListingCountQueryResponse,
} from "./ScheduledCouponListingCountQuery";
import AccountService from "@service/account/AccountService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ScheduledCouponListingCountQueryError from "./error/ScheduledCouponListingCountQueryError";

@QueryHandler(ScheduledCouponListingCountQuery)
export class ScheduledCouponListingCountQueryHandler implements IQueryHandler<ScheduledCouponListingCountQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
  ) {}

  async execute(query: ScheduledCouponListingCountQuery): Promise<ScheduledCouponListingCountQueryResponse> {
    try {
      const { securityId } = query;

      const securityEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(securityId);

      const count = await this.queryAdapter.scheduledCouponListingCount(securityEvmAddress);

      return Promise.resolve(new ScheduledCouponListingCountQueryResponse(count));
    } catch (error) {
      throw new ScheduledCouponListingCountQueryError(error as Error);
    }
  }
}
