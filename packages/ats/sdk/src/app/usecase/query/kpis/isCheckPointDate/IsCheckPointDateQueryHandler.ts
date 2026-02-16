// SPDX-License-Identifier: Apache-2.0

import { IQueryHandler } from "@core/query/QueryHandler";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { IsCheckPointDateQuery, IsCheckPointDateQueryResponse } from "./IsCheckPointDateQuery";
import { IsCheckPointDateQueryError } from "./error/IsCheckPointDateQueryError";

@QueryHandler(IsCheckPointDateQuery)
export class IsCheckPointDateQueryHandler implements IQueryHandler<IsCheckPointDateQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: IsCheckPointDateQuery): Promise<IsCheckPointDateQueryResponse> {
    try {
      const { securityId, date, project } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const projectEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(project);
      const res = await this.queryAdapter.isCheckPointDate(securityEvmAddress, Number(date), projectEvmAddress);

      return new IsCheckPointDateQueryResponse(res);
    } catch (error) {
      throw new IsCheckPointDateQueryError(error as Error);
    }
  }
}
