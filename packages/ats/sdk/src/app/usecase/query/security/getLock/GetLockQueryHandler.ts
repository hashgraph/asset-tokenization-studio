// SPDX-License-Identifier: Apache-2.0

import { GetLockQuery, GetLockQueryResponse } from "./GetLockQuery";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import SecurityService from "@service/security/SecurityService";
import { Lock } from "@domain/context/security/Lock";
import AccountService from "@service/account/AccountService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import BigDecimal from "@domain/context/shared/BigDecimal";
import ContractService from "@service/contract/ContractService";
import { GetLockQueryError } from "./error/GetLockQueryError";

@QueryHandler(GetLockQuery)
export class GetLockQueryHandler implements IQueryHandler<GetLockQuery> {
  constructor(
    @lazyInject(SecurityService)
    private readonly securityService: SecurityService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
  ) {}

  async execute(query: GetLockQuery): Promise<GetLockQueryResponse> {
    try {
      const { targetId, securityId, id } = query;
      const security = await this.securityService.get(securityId);

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const targetEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(targetId);

      const res = await this.queryAdapter.getLock(securityEvmAddress, targetEvmAddress, id);

      const amount = BigDecimal.fromStringFixed(res[0].toString(), security.decimals);
      const expirationDate = res[1];

      return new GetLockQueryResponse(new Lock(id, amount, expirationDate));
    } catch (error) {
      throw new GetLockQueryError(error as Error);
    }
  }
}
