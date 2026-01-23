// SPDX-License-Identifier: Apache-2.0

import EvmAddress from "@domain/context/contract/EvmAddress";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { GetCouponQuery, GetCouponQueryResponse } from "./GetCouponQuery";
import ContractService from "@service/contract/ContractService";
import { GetCouponQueryError } from "./error/GetCouponQueryError";

@QueryHandler(GetCouponQuery)
export class GetCouponQueryHandler implements IQueryHandler<GetCouponQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetCouponQuery): Promise<GetCouponQueryResponse> {
    try {
      const { securityId, couponId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const res = await this.queryAdapter.getCoupon(securityEvmAddress, couponId);

      return Promise.resolve(new GetCouponQueryResponse(res));
    } catch (error) {
      throw new GetCouponQueryError(error as Error);
    }
  }
}
