// SPDX-License-Identifier: Apache-2.0

import { GetKycStatusMockQuery, GetKycStatusMockQueryResponse } from "./GetKycStatusMockQuery";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import ContractService from "@service/contract/ContractService";
import AccountService from "@service/account/AccountService";

@QueryHandler(GetKycStatusMockQuery)
export class GetKycStatusMockQueryHandler implements IQueryHandler<GetKycStatusMockQuery> {
  constructor(
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
  ) {}

  async execute(query: GetKycStatusMockQuery): Promise<GetKycStatusMockQueryResponse> {
    const { contractId, targetId } = query;

    const contractEvmAddress = await this.contractService.getContractEvmAddress(contractId);

    const targetEvmAddress = await this.accountService.getAccountEvmAddress(targetId);

    const res = await this.queryAdapter.getKycStatusMock(contractEvmAddress, targetEvmAddress);
    return new GetKycStatusMockQueryResponse(res);
  }
}
