// SPDX-License-Identifier: Apache-2.0

import { IQueryHandler } from "@core/query/QueryHandler";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { GetControlListTypeQuery, GetControlListTypeQueryResponse } from "./GetControlListTypeQuery";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { SecurityControlListType } from "@domain/context/security/SecurityControlListType";
import { GetControlListTypeQueryError } from "./error/GetControlListTypeQueryError";

@QueryHandler(GetControlListTypeQuery)
export class GetControlListTypeQueryHandler implements IQueryHandler<GetControlListTypeQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetControlListTypeQuery): Promise<GetControlListTypeQueryResponse> {
    try {
      const { securityId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const res = await this.queryAdapter.getControlListType(securityEvmAddress);

      return new GetControlListTypeQueryResponse(
        res ? SecurityControlListType.WHITELIST : SecurityControlListType.BLACKLIST,
      );
    } catch (error) {
      throw new GetControlListTypeQueryError(error as Error);
    }
  }
}
