// SPDX-License-Identifier: Apache-2.0

import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import AccountService from "@service/account/AccountService";
import ContractService from "@service/contract/ContractService";
import { GetActiveAmortizationHoldHoldersQueryError } from "./error/GetActiveAmortizationHoldHoldersQueryError";
import {
  GetActiveAmortizationHoldHoldersQuery,
  GetActiveAmortizationHoldHoldersQueryResponse,
} from "./GetActiveAmortizationHoldHoldersQuery";
import EvmAddress from "@domain/context/contract/EvmAddress";

@QueryHandler(GetActiveAmortizationHoldHoldersQuery)
export class GetActiveAmortizationHoldHoldersQueryHandler implements IQueryHandler<GetActiveAmortizationHoldHoldersQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetActiveAmortizationHoldHoldersQuery): Promise<GetActiveAmortizationHoldHoldersQueryResponse> {
    try {
      const { securityId, amortizationId, start, end } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      const res = await this.queryAdapter.getActiveAmortizationHoldHolders(
        securityEvmAddress,
        amortizationId,
        start,
        end,
      );

      const updatedRes = await Promise.all(
        res.map(async (address) => (await this.accountService.getAccountInfo(address)).id.toString()),
      );

      return new GetActiveAmortizationHoldHoldersQueryResponse(updatedRes);
    } catch (error) {
      throw new GetActiveAmortizationHoldHoldersQueryError(error as Error);
    }
  }
}
