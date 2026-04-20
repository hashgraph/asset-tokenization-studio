// SPDX-License-Identifier: Apache-2.0

import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import AccountService from "@service/account/AccountService";
import ContractService from "@service/contract/ContractService";
import { GetAmortizationHoldersQueryError } from "./error/GetAmortizationHoldersQueryError";
import { GetAmortizationHoldersQuery, GetAmortizationHoldersQueryResponse } from "./GetAmortizationHoldersQuery";
import EvmAddress from "@domain/context/contract/EvmAddress";

@QueryHandler(GetAmortizationHoldersQuery)
export class GetAmortizationHoldersQueryHandler implements IQueryHandler<GetAmortizationHoldersQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetAmortizationHoldersQuery): Promise<GetAmortizationHoldersQueryResponse> {
    try {
      const { securityId, amortizationId, start, end } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      const res = await this.queryAdapter.getAmortizationHolders(securityEvmAddress, amortizationId, start, end);

      const updatedRes = await Promise.all(
        res.map(async (address) => (await this.accountService.getAccountInfo(address)).id.toString()),
      );

      return new GetAmortizationHoldersQueryResponse(updatedRes);
    } catch (error) {
      throw new GetAmortizationHoldersQueryError(error as Error);
    }
  }
}
