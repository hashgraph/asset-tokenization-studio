// SPDX-License-Identifier: Apache-2.0

import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { GetNonceQuery, GetNonceQueryResponse } from "./GetNonceQuery";
import AccountService from "@service/account/AccountService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetNonceQueryError } from "./error/GetNonceQueryError";

@QueryHandler(GetNonceQuery)
export class GetNonceQueryHandler implements IQueryHandler<GetNonceQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetNonceQuery): Promise<GetNonceQueryResponse> {
    try {
      const { securityId, targetId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      const res = await this.queryAdapter.getNonceFor(securityEvmAddress, targetEvmAddress);
      return new GetNonceQueryResponse(Number(res));
    } catch (error) {
      throw new GetNonceQueryError(error as Error);
    }
  }
}
