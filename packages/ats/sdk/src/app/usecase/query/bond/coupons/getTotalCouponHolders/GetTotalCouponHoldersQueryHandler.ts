// SPDX-License-Identifier: Apache-2.0

import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import ContractService from "@service/contract/ContractService";
import { GetTotalCouponHoldersQueryError } from "./error/GetTotalCouponHoldersQueryError";
import { GetTotalCouponHoldersQuery, GetTotalCouponHoldersQueryResponse } from "./GetTotalCouponHoldersQuery";
import EvmAddress from "@domain/context/contract/EvmAddress";

@QueryHandler(GetTotalCouponHoldersQuery)
export class GetTotalCouponHoldersQueryHandler implements IQueryHandler<GetTotalCouponHoldersQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetTotalCouponHoldersQuery): Promise<GetTotalCouponHoldersQueryResponse> {
    try {
      const { securityId, couponId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      const res = await this.queryAdapter.getTotalCouponHolders(securityEvmAddress, couponId);

      return new GetTotalCouponHoldersQueryResponse(res);
    } catch (error) {
      throw new GetTotalCouponHoldersQueryError(error as Error);
    }
  }
}
