// SPDX-License-Identifier: Apache-2.0

import { Security } from "@domain/context/security/Security";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { GetSecurityQuery, GetSecurityQueryResponse } from "./GetSecurityQuery";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { GetSecurityQueryError } from "./error/GetSecurityQueryError";

@QueryHandler(GetSecurityQuery)
export class GetSecurityQueryHandler implements IQueryHandler<GetSecurityQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetSecurityQuery): Promise<GetSecurityQueryResponse> {
    try {
      const { securityId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const security: Security = await this.queryAdapter.getSecurity(securityEvmAddress);

      if (security.maxSupply)
        security.maxSupply = BigDecimal.fromStringFixed(security.maxSupply.toString(), security.decimals);
      if (security.totalSupply)
        security.totalSupply = BigDecimal.fromStringFixed(security.totalSupply.toString(), security.decimals);

      return Promise.resolve(new GetSecurityQueryResponse(security));
    } catch (error) {
      throw new GetSecurityQueryError(error as Error);
    }
  }
}
