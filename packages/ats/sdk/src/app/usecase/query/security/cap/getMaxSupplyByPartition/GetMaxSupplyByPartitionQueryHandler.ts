// SPDX-License-Identifier: Apache-2.0

import { GetMaxSupplyByPartitionQuery, GetMaxSupplyByPartitionQueryResponse } from "./GetMaxSupplyByPartitionQuery";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import SecurityService from "@service/security/SecurityService";
import BigDecimal from "@domain/context/shared/BigDecimal";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetMaxSupplyByPartitionQueryError } from "./error/GetMaxSupplyByPartitionQueryError";

@QueryHandler(GetMaxSupplyByPartitionQuery)
export class GetMaxSupplyByPartitionQueryHandler implements IQueryHandler<GetMaxSupplyByPartitionQuery> {
  constructor(
    @lazyInject(SecurityService)
    private readonly securityService: SecurityService,
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetMaxSupplyByPartitionQuery): Promise<GetMaxSupplyByPartitionQueryResponse> {
    try {
      const { securityId, partitionId } = query;
      const security = await this.securityService.get(securityId);

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      const res = await this.queryAdapter.getMaxSupplyByPartition(securityEvmAddress, partitionId);
      const amount = BigDecimal.fromStringFixed(res.toString(), security.decimals);
      return new GetMaxSupplyByPartitionQueryResponse(amount);
    } catch (error) {
      throw new GetMaxSupplyByPartitionQueryError(error as Error);
    }
  }
}
