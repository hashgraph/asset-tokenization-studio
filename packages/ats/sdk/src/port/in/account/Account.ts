// SPDX-License-Identifier: Apache-2.0

import AccountViewModel from "./../response/AccountViewModel";
import GetAccountInfoRequest from "./../request/account/GetAccountInfoRequest";
import GetAccountBalanceRequest from "./../request/account/GetAccountBalanceRequest";
import ValidatedRequest from "@core/validation/ValidatedArgs";

import { GetAccountInfoQuery } from "@query/account/info/GetAccountInfoQuery";
import { QueryBus } from "@core/query/QueryBus";
import Injectable from "@core/injectable/Injectable";
import { HederaId } from "@domain/context/shared/HederaId";
import { LogError } from "@core/decorator/LogErrorDecorator";
import { GetAccountBalanceQuery } from "@query/account/balance/GetAccountBalanceQuery";
import BigDecimal from "@domain/context/shared/BigDecimal";

interface IAccountInPort {
  getInfo(request: GetAccountInfoRequest): Promise<AccountViewModel>;
}

class AccountInPort implements IAccountInPort {
  constructor(private readonly queryBus: QueryBus = Injectable.resolve(QueryBus)) {}

  @LogError
  async getInfo(request: GetAccountInfoRequest): Promise<AccountViewModel> {
    ValidatedRequest.handleValidation("GetAccountInfoRequest", request);
    const res = await this.queryBus.execute(new GetAccountInfoQuery(HederaId.from(request.account.accountId)));
    const account: AccountViewModel = {
      id: res.account.id.toString(),
      accountEvmAddress: res.account.evmAddress,
      publicKey: res.account.publicKey ? res.account.publicKey : undefined,
      alias: res.account.alias,
    };

    return account;
  }

  @LogError
  async getBalance(request: GetAccountBalanceRequest): Promise<BigDecimal> {
    ValidatedRequest.handleValidation("GetAccountBalanceRequest", request);
    const res = await this.queryBus.execute(new GetAccountBalanceQuery(request.securityId, request.targetId));
    return res.payload;
  }
}

const Account = new AccountInPort();
export default Account;
