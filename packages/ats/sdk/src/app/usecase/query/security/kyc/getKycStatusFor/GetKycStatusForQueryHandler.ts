// SPDX-License-Identifier: Apache-2.0

import { IQueryHandler } from "@core/query/QueryHandler";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import AccountService from "@service/account/AccountService";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { GetKycStatusForQuery, GetKycStatusForQueryResponse } from "./GetKycStatusForQuery";
import ContractService from "@service/contract/ContractService";
import { GetKycStatusForQueryError } from "./error/GetKycStatusForQueryError";

@QueryHandler(GetKycStatusForQuery)
export class GetKycStatusForQueryHandler implements IQueryHandler<GetKycStatusForQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetKycStatusForQuery): Promise<GetKycStatusForQueryResponse> {
    try {
      const { securityId, targetId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      const res = await this.queryAdapter.getKycStatusFor(securityEvmAddress, targetEvmAddress);

      return new GetKycStatusForQueryResponse(res);
    } catch (error) {
      throw new GetKycStatusForQueryError(error as Error);
    }
  }
}
