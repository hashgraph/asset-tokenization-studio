// SPDX-License-Identifier: Apache-2.0

import { ActionContentHashExistsQuery, ActionContentHashExistsQueryResponse } from "./ActionContentHashExistsQuery";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { ActionContentHashExistsQueryError } from "./error/ActionContentHashExistsQueryError";

@QueryHandler(ActionContentHashExistsQuery)
export class ActionContentHashExistsQueryHandler implements IQueryHandler<ActionContentHashExistsQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: ActionContentHashExistsQuery): Promise<ActionContentHashExistsQueryResponse> {
    try {
      const { securityId, contentHash } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      const res = await this.queryAdapter.actionContentHashExists(securityEvmAddress, contentHash);

      return new ActionContentHashExistsQueryResponse(res);
    } catch (error) {
      throw new ActionContentHashExistsQueryError(error as Error);
    }
  }
}
