// SPDX-License-Identifier: Apache-2.0

import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import ContractService from "@service/contract/ContractService";
import { GetTotalActiveAmortizationHoldHoldersQueryError } from "./error/GetTotalActiveAmortizationHoldHoldersQueryError";
import {
  GetTotalActiveAmortizationHoldHoldersQuery,
  GetTotalActiveAmortizationHoldHoldersQueryResponse,
} from "./GetTotalActiveAmortizationHoldHoldersQuery";
import EvmAddress from "@domain/context/contract/EvmAddress";

@QueryHandler(GetTotalActiveAmortizationHoldHoldersQuery)
export class GetTotalActiveAmortizationHoldHoldersQueryHandler implements IQueryHandler<GetTotalActiveAmortizationHoldHoldersQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(
    query: GetTotalActiveAmortizationHoldHoldersQuery,
  ): Promise<GetTotalActiveAmortizationHoldHoldersQueryResponse> {
    try {
      const { securityId, amortizationId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      const res = await this.queryAdapter.getTotalActiveAmortizationHoldHolders(securityEvmAddress, amortizationId);

      return new GetTotalActiveAmortizationHoldHoldersQueryResponse(res);
    } catch (error) {
      throw new GetTotalActiveAmortizationHoldHoldersQueryError(error as Error);
    }
  }
}
