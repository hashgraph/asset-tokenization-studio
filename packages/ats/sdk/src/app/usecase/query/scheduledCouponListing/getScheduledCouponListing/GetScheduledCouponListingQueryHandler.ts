// SPDX-License-Identifier: Apache-2.0

import { IQueryHandler } from "@core/query/QueryHandler";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import {
  GetScheduledCouponListingQuery,
  GetScheduledCouponListingQueryResponse,
} from "./GetScheduledCouponListingQuery";
import { GetScheduledCouponListingQueryError } from "./error/GetScheduledCouponListingQueryError";

@QueryHandler(GetScheduledCouponListingQuery)
export class GetScheduledCouponListingQueryHandler implements IQueryHandler<GetScheduledCouponListingQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetScheduledCouponListingQuery): Promise<GetScheduledCouponListingQueryResponse> {
    try {
      const { securityId, pageIndex, pageLength } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const res = await this.queryAdapter.getScheduledCouponListing(securityEvmAddress, pageIndex, pageLength);

      return new GetScheduledCouponListingQueryResponse(res);
    } catch (error) {
      throw new GetScheduledCouponListingQueryError(error as Error);
    }
  }
}
