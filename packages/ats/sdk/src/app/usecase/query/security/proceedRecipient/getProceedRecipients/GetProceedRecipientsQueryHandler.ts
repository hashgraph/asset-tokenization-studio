// SPDX-License-Identifier: Apache-2.0

import { GetProceedRecipientsQuery, GetProceedRecipientsQueryResponse } from "./GetProceedRecipientsQuery";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetProceedRecipientsQueryError } from "./error/GetProceedRecipientsQueryError";
import AccountService from "@service/account/AccountService";

@QueryHandler(GetProceedRecipientsQuery)
export class GetProceedRecipientsQueryHandler implements IQueryHandler<GetProceedRecipientsQuery> {
  constructor(
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
  ) {}

  async execute(query: GetProceedRecipientsQuery): Promise<GetProceedRecipientsQueryResponse> {
    try {
      const { pageIndex, pageSize, securityId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      const res = await this.queryAdapter.getProceedRecipients(securityEvmAddress, pageIndex, pageSize);

      const proceedRecipientsIds = await Promise.all(
        res.map(async (b) => {
          return (await this.accountService.getAccountInfo(b)).id.toString();
        }),
      );

      return new GetProceedRecipientsQueryResponse(proceedRecipientsIds);
    } catch (error) {
      throw new GetProceedRecipientsQueryError(error as Error);
    }
  }
}
