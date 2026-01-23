// SPDX-License-Identifier: Apache-2.0

import { IQueryHandler } from "@core/query/QueryHandler";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import AccountService from "@service/account/AccountService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { GetKycForQuery, GetKycForQueryResponse } from "./GetKycForQuery";
import ContractService from "@service/contract/ContractService";
import { GetKycForQueryError } from "./error/GetKycForQueryError";

@QueryHandler(GetKycForQuery)
export class GetKycForQueryHandler implements IQueryHandler<GetKycForQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetKycForQuery): Promise<GetKycForQueryResponse> {
    try {
      const { securityId, targetId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      const res = await this.queryAdapter.getKycFor(securityEvmAddress, targetEvmAddress);

      return new GetKycForQueryResponse(res);
    } catch (error) {
      throw new GetKycForQueryError(error as Error);
    }
  }
}
