// SPDX-License-Identifier: Apache-2.0

import { GetNominalValueQuery, GetNominalValueQueryResponse } from "./GetNominalValueQuery";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetNominalValueQueryError } from "./error/GetNominalValueQueryError";

@QueryHandler(GetNominalValueQuery)
export class GetNominalValueQueryHandler implements IQueryHandler<GetNominalValueQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetNominalValueQuery): Promise<GetNominalValueQueryResponse> {
    try {
      const { securityId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const res = await this.queryAdapter.getNominalValue(securityEvmAddress);
      return new GetNominalValueQueryResponse(res);
    } catch (error) {
      throw new GetNominalValueQueryError(error as Error);
    }
  }
}
