// SPDX-License-Identifier: Apache-2.0

import { IQueryHandler } from "@core/query/QueryHandler";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import AccountService from "@service/account/AccountService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { GetKycAccountsDataQuery, GetKycAccountsDataQueryResponse } from "./GetKycAccountsDataQuery";
import { KycAccountData } from "@domain/context/kyc/KycAccountData";
import ContractService from "@service/contract/ContractService";
import { GetKycAccountsDataQueryError } from "./error/GetKycAccountsDataQueryError";

@QueryHandler(GetKycAccountsDataQuery)
export class GetKycAccountsDataQueryHandler implements IQueryHandler<GetKycAccountsDataQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetKycAccountsDataQuery): Promise<GetKycAccountsDataQueryResponse> {
    try {
      const { securityId, kycStatus, start, end } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const kycAccountsData = await this.queryAdapter.getKycAccountsData(securityEvmAddress, kycStatus, start, end);

      const kycDataHederaIdFormat = (await Promise.all(
        kycAccountsData.map(async (item) => ({
          ...item,
          issuer: (await this.accountService.getAccountInfo(item.issuer)).id.toString(),
          account: (await this.accountService.getAccountInfo(item.account)).id.toString(),
        })),
      )) as KycAccountData[];

      return new GetKycAccountsDataQueryResponse(kycDataHederaIdFormat);
    } catch (error) {
      throw new GetKycAccountsDataQueryError(error as Error);
    }
  }
}
