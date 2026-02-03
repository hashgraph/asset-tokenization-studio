// SPDX-License-Identifier: Apache-2.0

import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { IsClearingActivatedQuery, IsClearingActivatedQueryResponse } from "./IsClearingActivatedQuery";
import ContractService from "@service/contract/ContractService";
import { IsClearingActivatedQueryError } from "./error/IsClearingActivatedQueryError";

@QueryHandler(IsClearingActivatedQuery)
export class IsClearingActivatedQueryHandler implements IQueryHandler<IsClearingActivatedQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: IsClearingActivatedQuery): Promise<IsClearingActivatedQueryResponse> {
    try {
      const { securityId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const res = await this.queryAdapter.isClearingActivated(securityEvmAddress);

      return new IsClearingActivatedQueryResponse(res);
    } catch (error) {
      throw new IsClearingActivatedQueryError(error as Error);
    }
  }
}
