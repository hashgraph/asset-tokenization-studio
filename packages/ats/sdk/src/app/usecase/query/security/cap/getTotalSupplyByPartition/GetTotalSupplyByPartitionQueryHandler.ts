// SPDX-License-Identifier: Apache-2.0

import {
  GetTotalSupplyByPartitionQuery,
  GetTotalSupplyByPartitionQueryResponse,
} from "./GetTotalSupplyByPartitionQuery";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import SecurityService from "@service/security/SecurityService";
import BigDecimal from "@domain/context/shared/BigDecimal";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetTotalSupplyByPartitionQueryError } from "./error/GetTotalSupplyByPartitionQueryError";

@QueryHandler(GetTotalSupplyByPartitionQuery)
export class GetTotalSupplyByPartitionQueryHandler implements IQueryHandler<GetTotalSupplyByPartitionQuery> {
  constructor(
    @lazyInject(SecurityService)
    private readonly securityService: SecurityService,
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetTotalSupplyByPartitionQuery): Promise<GetTotalSupplyByPartitionQueryResponse> {
    try {
      const { securityId, partitionId } = query;
      const security = await this.securityService.get(securityId);

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      const res = await this.queryAdapter.getTotalSupplyByPartition(securityEvmAddress, partitionId);
      const amount = BigDecimal.fromStringFixed(res.toString(), security.decimals);
      return new GetTotalSupplyByPartitionQueryResponse(amount);
    } catch (error) {
      throw new GetTotalSupplyByPartitionQueryError(error as Error);
    }
  }
}
