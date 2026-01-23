// SPDX-License-Identifier: Apache-2.0

import { IsProceedRecipientQuery, IsProceedRecipientQueryResponse } from "./IsProceedRecipientQuery";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import AccountService from "@service/account/AccountService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { IsProceedRecipientQueryError } from "./error/IsProceedRecipientQueryError";

@QueryHandler(IsProceedRecipientQuery)
export class IsProceedRecipientQueryHandler implements IQueryHandler<IsProceedRecipientQuery> {
  constructor(
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
  ) {}

  async execute(query: IsProceedRecipientQuery): Promise<IsProceedRecipientQueryResponse> {
    try {
      const { targetId, securityId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      const res = await this.queryAdapter.isProceedRecipient(securityEvmAddress, targetEvmAddress);

      return new IsProceedRecipientQueryResponse(res);
    } catch (error) {
      throw new IsProceedRecipientQueryError(error as Error);
    }
  }
}
