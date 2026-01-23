// SPDX-License-Identifier: Apache-2.0

import {
  GetProceedRecipientsCountQuery,
  GetProceedRecipientsCountQueryResponse,
} from "./GetProceedRecipientsCountQuery";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetProceedRecipientsCountQueryError } from "./error/GetProceedRecipientsCountQueryError";

@QueryHandler(GetProceedRecipientsCountQuery)
export class GetProceedRecipientsCountQueryHandler implements IQueryHandler<GetProceedRecipientsCountQuery> {
  constructor(
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
  ) {}

  async execute(query: GetProceedRecipientsCountQuery): Promise<GetProceedRecipientsCountQueryResponse> {
    try {
      const { securityId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      const res = await this.queryAdapter.getProceedRecipientsCount(securityEvmAddress);

      return new GetProceedRecipientsCountQueryResponse(res);
    } catch (error) {
      throw new GetProceedRecipientsCountQueryError(error as Error);
    }
  }
}
