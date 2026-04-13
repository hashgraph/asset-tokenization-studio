// SPDX-License-Identifier: Apache-2.0

import { IQueryHandler } from "@core/query/QueryHandler";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { GetAmortizationForQuery, GetAmortizationForQueryResponse } from "./GetAmortizationForQuery";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import AccountService from "@service/account/AccountService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetAmortizationForQueryError } from "./error/GetAmortizationForQueryError";

@QueryHandler(GetAmortizationForQuery)
export class GetAmortizationForQueryHandler implements IQueryHandler<GetAmortizationForQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetAmortizationForQuery): Promise<GetAmortizationForQueryResponse> {
    try {
      const { securityId, targetId, amortizationId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      const res = await this.queryAdapter.getAmortizationFor(securityEvmAddress, targetEvmAddress, amortizationId);

      return new GetAmortizationForQueryResponse(res);
    } catch (error) {
      throw new GetAmortizationForQueryError(error as Error);
    }
  }
}
