// SPDX-License-Identifier: Apache-2.0

import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { IsAddressRecoveredQuery, IsAddressRecoveredQueryResponse } from "./IsAddressRecoveredQuery";
import AccountService from "@service/account/AccountService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { IsAddressRecoveredQueryError } from "./error/IsAddressRecoveredQueryError";

@QueryHandler(IsAddressRecoveredQuery)
export class IsAddressRecoveredQueryHandler implements IQueryHandler<IsAddressRecoveredQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: IsAddressRecoveredQuery): Promise<IsAddressRecoveredQueryResponse> {
    try {
      const { securityId, targetId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      const res = await this.queryAdapter.isAddressRecovered(securityEvmAddress, targetEvmAddress);
      return new IsAddressRecoveredQueryResponse(res);
    } catch (error) {
      throw new IsAddressRecoveredQueryError(error as Error);
    }
  }
}
