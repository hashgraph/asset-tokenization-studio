// SPDX-License-Identifier: Apache-2.0

import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { GetCouponHoldersQuery, GetCouponHoldersQueryResponse } from "./GetCouponHoldersQuery";
import { IQueryHandler } from "@core/query/QueryHandler";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import AccountService from "@service/account/AccountService";
import ContractService from "@service/contract/ContractService";
import { GetCouponHoldersQueryError } from "./error/GetCouponHoldersQueryError";
import EvmAddress from "@domain/context/contract/EvmAddress";

@QueryHandler(GetCouponHoldersQuery)
export class GetCouponHoldersQueryHandler implements IQueryHandler<GetCouponHoldersQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetCouponHoldersQuery): Promise<GetCouponHoldersQueryResponse> {
    try {
      const { securityId, couponId, start, end } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      const res = await this.queryAdapter.getCouponHolders(securityEvmAddress, couponId, start, end);

      const updatedRes = await Promise.all(
        res.map(async (address) => (await this.accountService.getAccountInfo(address)).id.toString()),
      );

      return new GetCouponHoldersQueryResponse(updatedRes);
    } catch (error) {
      throw new GetCouponHoldersQueryError(error as Error);
    }
  }
}
