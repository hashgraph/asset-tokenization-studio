// SPDX-License-Identifier: Apache-2.0

import { IQueryHandler } from "@core/query/QueryHandler";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { GetCouponsForQuery, GetCouponsForQueryResponse } from "./GetCouponsForQuery";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { GetCouponsForQueryError } from "./error/GetCouponsForQueryError";

@QueryHandler(GetCouponsForQuery)
export class GetCouponsForQueryHandler implements IQueryHandler<GetCouponsForQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetCouponsForQuery): Promise<GetCouponsForQueryResponse> {
    try {
      const { securityId, couponId, pageIndex, pageLength } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      const res = await this.queryAdapter.getCouponsFor(securityEvmAddress, couponId, pageIndex, pageLength);

      return new GetCouponsForQueryResponse(res.coupons, res.accounts);
    } catch (error) {
      throw new GetCouponsForQueryError(error as Error);
    }
  }
}
