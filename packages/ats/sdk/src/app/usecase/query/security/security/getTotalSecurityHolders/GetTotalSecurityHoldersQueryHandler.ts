// SPDX-License-Identifier: Apache-2.0

import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import ContractService from "@service/contract/ContractService";
import { GetTotalSecurityHoldersQueryError } from "./error/GetTotalSecurityHoldersQueryError";
import { GetTotalSecurityHoldersQuery, GetTotalSecurityHoldersQueryResponse } from "./GetTotalSecurityHoldersQuery";
import EvmAddress from "@domain/context/contract/EvmAddress";

@QueryHandler(GetTotalSecurityHoldersQuery)
export class GetTotalSecurityHoldersQueryHandler implements IQueryHandler<GetTotalSecurityHoldersQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetTotalSecurityHoldersQuery): Promise<GetTotalSecurityHoldersQueryResponse> {
    try {
      const { securityId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      const res = await this.queryAdapter.getTotalSecurityHolders(securityEvmAddress);

      return new GetTotalSecurityHoldersQueryResponse(res);
    } catch (error) {
      throw new GetTotalSecurityHoldersQueryError(error as Error);
    }
  }
}
