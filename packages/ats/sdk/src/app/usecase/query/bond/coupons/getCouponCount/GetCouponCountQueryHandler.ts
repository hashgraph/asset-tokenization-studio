// SPDX-License-Identifier: Apache-2.0

import { IQueryHandler } from "@core/query/QueryHandler";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { GetCouponCountQuery, GetCouponCountQueryResponse } from "./GetCouponCountQuery";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetCouponCountQueryError } from "./error/GetCouponCountQueryError";

@QueryHandler(GetCouponCountQuery)
export class GetCouponCountQueryHandler implements IQueryHandler<GetCouponCountQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetCouponCountQuery): Promise<GetCouponCountQueryResponse> {
    try {
      const { securityId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const res = await this.queryAdapter.getCouponCount(securityEvmAddress);

      return new GetCouponCountQueryResponse(res);
    } catch (error) {
      throw new GetCouponCountQueryError(error as Error);
    }
  }
}
