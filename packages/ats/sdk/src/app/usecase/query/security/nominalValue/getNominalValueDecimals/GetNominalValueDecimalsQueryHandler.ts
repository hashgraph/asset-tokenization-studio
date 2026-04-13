// SPDX-License-Identifier: Apache-2.0

import { GetNominalValueDecimalsQuery, GetNominalValueDecimalsQueryResponse } from "./GetNominalValueDecimalsQuery";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetNominalValueDecimalsQueryError } from "./error/GetNominalValueDecimalsQueryError";

@QueryHandler(GetNominalValueDecimalsQuery)
export class GetNominalValueDecimalsQueryHandler implements IQueryHandler<GetNominalValueDecimalsQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetNominalValueDecimalsQuery): Promise<GetNominalValueDecimalsQueryResponse> {
    try {
      const { securityId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const res = await this.queryAdapter.getNominalValueDecimals(securityEvmAddress);
      return new GetNominalValueDecimalsQueryResponse(res);
    } catch (error) {
      throw new GetNominalValueDecimalsQueryError(error as Error);
    }
  }
}
