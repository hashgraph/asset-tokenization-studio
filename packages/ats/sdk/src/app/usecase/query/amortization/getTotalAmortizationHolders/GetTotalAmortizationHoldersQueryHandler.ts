// SPDX-License-Identifier: Apache-2.0

import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import ContractService from "@service/contract/ContractService";
import { GetTotalAmortizationHoldersQueryError } from "./error/GetTotalAmortizationHoldersQueryError";
import {
  GetTotalAmortizationHoldersQuery,
  GetTotalAmortizationHoldersQueryResponse,
} from "./GetTotalAmortizationHoldersQuery";
import EvmAddress from "@domain/context/contract/EvmAddress";

@QueryHandler(GetTotalAmortizationHoldersQuery)
export class GetTotalAmortizationHoldersQueryHandler implements IQueryHandler<GetTotalAmortizationHoldersQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetTotalAmortizationHoldersQuery): Promise<GetTotalAmortizationHoldersQueryResponse> {
    try {
      const { securityId, amortizationId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      const res = await this.queryAdapter.getTotalAmortizationHolders(securityEvmAddress, amortizationId);

      return new GetTotalAmortizationHoldersQueryResponse(res);
    } catch (error) {
      throw new GetTotalAmortizationHoldersQueryError(error as Error);
    }
  }
}
