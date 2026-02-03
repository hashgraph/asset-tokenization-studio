// SPDX-License-Identifier: Apache-2.0

import { GetProceedRecipientDataQuery, GetProceedRecipientDataQueryResponse } from "./GetProceedRecipientDataQuery";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import AccountService from "@service/account/AccountService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetProceedRecipientDataQueryError } from "./error/GetProceedRecipientDataQueryError";

@QueryHandler(GetProceedRecipientDataQuery)
export class GetProceedRecipientDataQueryHandler implements IQueryHandler<GetProceedRecipientDataQuery> {
  constructor(
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
  ) {}

  async execute(query: GetProceedRecipientDataQuery): Promise<GetProceedRecipientDataQueryResponse> {
    try {
      const { targetId, securityId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      const res = await this.queryAdapter.getProceedRecipientData(securityEvmAddress, targetEvmAddress);

      return new GetProceedRecipientDataQueryResponse(res);
    } catch (error) {
      throw new GetProceedRecipientDataQueryError(error as Error);
    }
  }
}
