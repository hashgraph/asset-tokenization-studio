// SPDX-License-Identifier: Apache-2.0

import { ComplianceQuery, ComplianceQueryResponse } from "./ComplianceQuery";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { ComplianceQueryError } from "./error/ComplianceQueryError";
import { EVM_ZERO_ADDRESS, HEDERA_ZERO_ADDRESS } from "@core/Constants";
import AccountService from "@service/account/AccountService";

@QueryHandler(ComplianceQuery)
export class ComplianceQueryHandler implements IQueryHandler<ComplianceQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
  ) {}

  async execute(query: ComplianceQuery): Promise<ComplianceQueryResponse> {
    try {
      const { securityId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      let res = await this.queryAdapter.compliance(securityEvmAddress);

      res =
        res === EVM_ZERO_ADDRESS ? HEDERA_ZERO_ADDRESS : (await this.accountService.getAccountInfo(res)).id.toString();

      return new ComplianceQueryResponse(res);
    } catch (error) {
      throw new ComplianceQueryError(error as Error);
    }
  }
}
