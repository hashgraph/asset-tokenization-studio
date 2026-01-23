// SPDX-License-Identifier: Apache-2.0

import { IsPausedMockQuery, IsPausedMockQueryResponse } from "./IsPausedMockQuery";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import ContractService from "@service/contract/ContractService";

@QueryHandler(IsPausedMockQuery)
export class IsPausedMockQueryHandler implements IQueryHandler<IsPausedMockQuery> {
  constructor(
    @lazyInject(ContractService)
    public readonly contractService: ContractService,
    @lazyInject(RPCQueryAdapter)
    public readonly queryAdapter: RPCQueryAdapter,
  ) {}

  async execute(query: IsPausedMockQuery): Promise<IsPausedMockQueryResponse> {
    const { contractId } = query;

    const contractEvmAddress = await this.contractService.getContractEvmAddress(contractId);

    const res = await this.queryAdapter.isPausedMock(contractEvmAddress);
    return new IsPausedMockQueryResponse(res);
  }
}
