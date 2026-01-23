// SPDX-License-Identifier: Apache-2.0

import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { GetConfigInfoQuery, GetConfigInfoQueryResponse } from "./GetConfigInfoQuery";
import { IQueryHandler } from "@core/query/QueryHandler";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { DiamondConfiguration } from "@domain/context/security/DiamondConfiguration";
import { GetConfigInfoQueryError } from "./error/GetConfigInfoQueryError";

@QueryHandler(GetConfigInfoQuery)
export class GetConfigInfoQueryHandler implements IQueryHandler<GetConfigInfoQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetConfigInfoQuery): Promise<GetConfigInfoQueryResponse> {
    try {
      const securityId = query.securityId;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const [resolverAddress, configId, configVersion] = await this.queryAdapter.getConfigInfo(securityEvmAddress);

      return Promise.resolve(
        new GetConfigInfoQueryResponse(new DiamondConfiguration(resolverAddress, configId, configVersion)),
      );
    } catch (error) {
      throw new GetConfigInfoQueryError(error as Error);
    }
  }
}
