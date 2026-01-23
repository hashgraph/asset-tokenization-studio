// SPDX-License-Identifier: Apache-2.0

import { IQueryHandler } from "@core/query/QueryHandler";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { GetKycAccountsCountQuery, GetKycAccountsCountQueryResponse } from "./GetKycAccountsCountQuery";
import { GetKycAccountsCountQueryError } from "./error/GetKycAccountsCountQueryError";

@QueryHandler(GetKycAccountsCountQuery)
export class GetKycAccountsCountQueryHandler implements IQueryHandler<GetKycAccountsCountQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetKycAccountsCountQuery): Promise<GetKycAccountsCountQueryResponse> {
    try {
      const { securityId, kycStatus } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const res = await this.queryAdapter.getKycAccountsCount(securityEvmAddress, kycStatus);

      return new GetKycAccountsCountQueryResponse(res);
    } catch (error) {
      throw new GetKycAccountsCountQueryError(error as Error);
    }
  }
}
