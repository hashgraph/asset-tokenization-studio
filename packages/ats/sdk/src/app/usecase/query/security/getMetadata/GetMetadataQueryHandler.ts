// SPDX-License-Identifier: Apache-2.0

import { IQueryHandler } from "@core/query/QueryHandler";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import ContractService from "@service/contract/ContractService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { GetMetadataQuery, GetMetadataQueryResponse } from "./GetMetadataQuery";
import { GetMetadataQueryError } from "./error/GetMetadataQueryError";

@QueryHandler(GetMetadataQuery)
export class GetMetadataQueryHandler implements IQueryHandler<GetMetadataQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetMetadataQuery): Promise<GetMetadataQueryResponse> {
    try {
      const { securityId, key } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const res = await this.queryAdapter.getMetadata(securityEvmAddress, key);

      return new GetMetadataQueryResponse(res);
    } catch (error) {
      throw new GetMetadataQueryError(error as Error);
    }
  }
}
