// SPDX-License-Identifier: Apache-2.0

import { PartitionsProtectedQuery, PartitionsProtectedQueryResponse } from "./PartitionsProtectedQuery";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { PartitionsProtectedQueryError } from "./error/PartitionsProtectedQueryError";

@QueryHandler(PartitionsProtectedQuery)
export class PartitionsProtectedQueryHandler implements IQueryHandler<PartitionsProtectedQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: PartitionsProtectedQuery): Promise<PartitionsProtectedQueryResponse> {
    try {
      const { securityId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const res = await this.queryAdapter.arePartitionsProtected(securityEvmAddress);
      return new PartitionsProtectedQueryResponse(res);
    } catch (error) {
      throw new PartitionsProtectedQueryError(error as Error);
    }
  }
}
