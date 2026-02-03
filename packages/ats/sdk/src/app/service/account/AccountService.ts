// SPDX-License-Identifier: Apache-2.0

import { singleton } from "tsyringe";
import Injectable from "@core/injectable/Injectable";
import { QueryBus } from "@core/query/QueryBus";
import Account from "@domain/context/account/Account";
import { AccountIdNotValid } from "@domain/context/account/error/AccountIdNotValid";
import { HederaId } from "@domain/context/shared/HederaId";
import { GetAccountInfoQuery } from "@query/account/info/GetAccountInfoQuery";

import EvmAddress from "@domain/context/contract/EvmAddress";
import { HEDERA_FORMAT_ID_REGEX } from "@domain/context/shared/HederaId";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import { EVM_ZERO_ADDRESS } from "@core/Constants";
import Service from "@service/Service";
import NetworkService from "@service/network/NetworkService";
import TransactionService from "@service/transaction/TransactionService";
@singleton()
export default class AccountService extends Service {
  queryBus: QueryBus;

  constructor(
    public readonly networkService: NetworkService = Injectable.resolve(NetworkService),
    public readonly transactionService: TransactionService = Injectable.resolve(TransactionService),
    public readonly mirrorNodeAdapter: MirrorNodeAdapter = Injectable.resolve(MirrorNodeAdapter),
  ) {
    super();
  }

  getCurrentAccount(): Account {
    this.queryBus = Injectable.resolve(QueryBus);
    return this.transactionService.getHandler().getAccount();
  }

  async getAccountInfo(id: HederaId | string): Promise<Account> {
    this.queryBus = Injectable.resolve(QueryBus);
    const account = (await this.queryBus.execute(new GetAccountInfoQuery(id))).account;
    if (!account.id) throw new AccountIdNotValid(id.toString());
    return account;
  }

  async getAccountEvmAddress(accountId: string): Promise<EvmAddress> {
    const evmAddress = HEDERA_FORMAT_ID_REGEX.test(accountId)
      ? await this.mirrorNodeAdapter.accountToEvmAddress(accountId)
      : new EvmAddress(accountId);
    return evmAddress;
  }

  async getAccountEvmAddressOrNull(accountId: string): Promise<EvmAddress> {
    const evmAddress: EvmAddress =
      accountId === "0.0.0" ? new EvmAddress(EVM_ZERO_ADDRESS) : await this.getAccountEvmAddress(accountId);
    return evmAddress;
  }
}
