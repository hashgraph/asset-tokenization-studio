// SPDX-License-Identifier: Apache-2.0

import {
  IsAuthorizedWhiteListMockQuery,
  IsAuthorizedWhiteListMockQueryResponse,
} from "./IsAuthorizedWhiteListMockQuery";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import ContractService from "@service/contract/ContractService";
import AccountService from "@service/account/AccountService";

@QueryHandler(IsAuthorizedWhiteListMockQuery)
export class IsAuthorizedWhiteListMockQueryHandler implements IQueryHandler<IsAuthorizedWhiteListMockQuery> {
  constructor(
    @lazyInject(ContractService)
    public readonly contractService: ContractService,
    @lazyInject(RPCQueryAdapter)
    public readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    public readonly accountService: AccountService,
  ) {}

  async execute(query: IsAuthorizedWhiteListMockQuery): Promise<IsAuthorizedWhiteListMockQueryResponse> {
    const { contractId, targetId } = query;

    const contractEvmAddress = await this.contractService.getContractEvmAddress(contractId);

    const targetEvmAddress = await this.accountService.getAccountEvmAddress(targetId);

    const res = await this.queryAdapter.isAuthorizedWhiteListMock(contractEvmAddress, targetEvmAddress);
    return new IsAuthorizedWhiteListMockQueryResponse(res);
  }
}
