// SPDX-License-Identifier: Apache-2.0

import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import AccountService from "@service/account/AccountService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import {
  GetRevocationRegistryAddressQuery,
  GetRevocationRegistryAddressQueryResponse,
} from "./GetRevocationRegistryAddressQuery";
import ContractService from "@service/contract/ContractService";
import { GetRevocationRegistryAddressQueryError } from "./error/GetRevocationRegistryAddressQueryError";

@QueryHandler(GetRevocationRegistryAddressQuery)
export class GetRevocationRegistryAddressQueryHandler implements IQueryHandler<GetRevocationRegistryAddressQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetRevocationRegistryAddressQuery): Promise<GetRevocationRegistryAddressQueryResponse> {
    try {
      const { securityId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const res = await this.queryAdapter.getRevocationRegistryAddress(securityEvmAddress);

      const hederaId = (await this.accountService.getAccountInfo(res)).id.toString();

      return new GetRevocationRegistryAddressQueryResponse(hederaId);
    } catch (error) {
      throw new GetRevocationRegistryAddressQueryError(error as Error);
    }
  }
}
