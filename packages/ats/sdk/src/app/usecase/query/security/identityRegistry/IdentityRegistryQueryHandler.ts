// SPDX-License-Identifier: Apache-2.0

import { IdentityRegistryQuery, IdentityRegistryQueryResponse } from "./IdentityRegistryQuery";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { IdentityRegistryQueryError } from "./error/IdentityRegistryQueryError";
import { EVM_ZERO_ADDRESS, HEDERA_ZERO_ADDRESS } from "@core/Constants";
import AccountService from "@service/account/AccountService";

@QueryHandler(IdentityRegistryQuery)
export class IdentityRegistryQueryHandler implements IQueryHandler<IdentityRegistryQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
  ) {}

  async execute(query: IdentityRegistryQuery): Promise<IdentityRegistryQueryResponse> {
    try {
      const { securityId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      let res = await this.queryAdapter.identityRegistry(securityEvmAddress);

      res =
        res === EVM_ZERO_ADDRESS ? HEDERA_ZERO_ADDRESS : (await this.accountService.getAccountInfo(res)).id.toString();

      return new IdentityRegistryQueryResponse(res);
    } catch (error) {
      throw new IdentityRegistryQueryError(error as Error);
    }
  }
}
