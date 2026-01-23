// SPDX-License-Identifier: Apache-2.0

import { GetMaxSupplyQuery, GetMaxSupplyQueryResponse } from "./GetMaxSupplyQuery";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import SecurityService from "@service/security/SecurityService";
import BigDecimal from "@domain/context/shared/BigDecimal";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetMaxSupplyQueryError } from "./error/GetMaxSupplyQueryError";

@QueryHandler(GetMaxSupplyQuery)
export class GetMaxSupplyQueryHandler implements IQueryHandler<GetMaxSupplyQuery> {
  constructor(
    @lazyInject(SecurityService)
    private readonly securityService: SecurityService,
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetMaxSupplyQuery): Promise<GetMaxSupplyQueryResponse> {
    try {
      const { securityId } = query;
      const security = await this.securityService.get(securityId);

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      const res = await this.queryAdapter.getMaxSupply(securityEvmAddress);
      const amount = BigDecimal.fromStringFixed(res.toString(), security.decimals);
      return new GetMaxSupplyQueryResponse(amount);
    } catch (error) {
      throw new GetMaxSupplyQueryError(error as Error);
    }
  }
}
