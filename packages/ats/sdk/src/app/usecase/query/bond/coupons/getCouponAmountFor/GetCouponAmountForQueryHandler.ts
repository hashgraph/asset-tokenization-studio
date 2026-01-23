// SPDX-License-Identifier: Apache-2.0

import { IQueryHandler } from "@core/query/QueryHandler";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { GetCouponAmountForQuery, GetCouponAmountForQueryResponse } from "./GetCouponAmountForQuery";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import AccountService from "@service/account/AccountService";
import { GetCouponAmountForQueryError } from "./error/GetCouponAmountForQueryError";

@QueryHandler(GetCouponAmountForQuery)
export class GetCouponAmountForQueryHandler implements IQueryHandler<GetCouponAmountForQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetCouponAmountForQuery): Promise<GetCouponAmountForQueryResponse> {
    try {
      const { targetId, securityId, couponId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      const res = await this.queryAdapter.getCouponAmountFor(securityEvmAddress, targetEvmAddress, couponId);

      return new GetCouponAmountForQueryResponse(res.numerator, res.denominator, res.recordDateReached);
    } catch (error) {
      throw new GetCouponAmountForQueryError(error as Error);
    }
  }
}
