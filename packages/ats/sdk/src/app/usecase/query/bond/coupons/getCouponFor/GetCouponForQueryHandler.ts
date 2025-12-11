//SPDX-License-Identifier: Apache-2.0

import { IQueryHandler } from "@core/query/QueryHandler";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { GetCouponForQuery, GetCouponForQueryResponse } from "./GetCouponForQuery";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import AccountService from "@service/account/AccountService";
import { GetCouponForQueryError } from "./error/GetCouponForQueryError";

@QueryHandler(GetCouponForQuery)
export class GetCouponForQueryHandler implements IQueryHandler<GetCouponForQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetCouponForQuery): Promise<GetCouponForQueryResponse> {
    try {
      const { targetId, securityId, couponId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      const res = await this.queryAdapter.getCouponFor(securityEvmAddress, targetEvmAddress, couponId);

      return new GetCouponForQueryResponse(res.tokenBalance || "0", res.decimals);
    } catch (error) {
      throw new GetCouponForQueryError(error as Error);
    }
  }
}
