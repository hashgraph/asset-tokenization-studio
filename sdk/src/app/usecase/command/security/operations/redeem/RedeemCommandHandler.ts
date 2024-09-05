/*
 *
 * Hedera Asset Tokenization Studio SDK
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { ICommandHandler } from '../../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../../core/decorator/CommandHandlerDecorator.js';
import AccountService from '../../../../../service/AccountService.js';
import SecurityService from '../../../../../service/SecurityService.js';
import { RedeemCommand, RedeemCommandResponse } from './RedeemCommand.js';
import TransactionService from '../../../../../service/TransactionService.js';
import { lazyInject } from '../../../../../../core/decorator/LazyInjectDecorator.js';
import BigDecimal from '../../../../../../domain/context/shared/BigDecimal.js';
import { DecimalsOverRange } from '../../error/DecimalsOverRange.js';
import CheckNums from '../../../../../../core/checks/numbers/CheckNums.js';
import { InsufficientBalance } from '../../error/InsufficientBalance.js';
import { RPCQueryAdapter } from '../../../../../../port/out/rpc/RPCQueryAdapter.js';
import { SecurityPaused } from '../../error/SecurityPaused.js';
import EvmAddress from '../../../../../../domain/context/contract/EvmAddress.js';
import { HEDERA_FORMAT_ID_REGEX } from '../../../../../../domain/context/shared/HederaId.js';
import { MirrorNodeAdapter } from '../../../../../../port/out/mirror/MirrorNodeAdapter.js';
import { SecurityControlListType } from '../../../../../../domain/context/security/SecurityControlListType.js';
import { AccountInBlackList } from '../../error/AccountInBlackList.js';
import { AccountNotInWhiteList } from '../../error/AccountNotInWhiteList.js';

@CommandHandler(RedeemCommand)
export class RedeemCommandHandler implements ICommandHandler<RedeemCommand> {
  constructor(
    @lazyInject(SecurityService)
    public readonly securityService: SecurityService,
    @lazyInject(TransactionService)
    public readonly transactionService: TransactionService,
    @lazyInject(AccountService)
    public readonly accountService: AccountService,
    @lazyInject(RPCQueryAdapter)
    public readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(MirrorNodeAdapter)
    private readonly mirrorNodeAdapter: MirrorNodeAdapter,
  ) {}

  async execute(command: RedeemCommand): Promise<RedeemCommandResponse> {
    const { securityId, amount } = command;
    const handler = this.transactionService.getHandler();
    const account = this.accountService.getCurrentAccount();

    const securityEvmAddress: EvmAddress = new EvmAddress(
      HEDERA_FORMAT_ID_REGEX.test(securityId)
        ? (await this.mirrorNodeAdapter.getContractInfo(securityId)).evmAddress
        : securityId.toString(),
    );

    const controListType = (await this.queryAdapter.getControlListType(
      securityEvmAddress,
    ))
      ? SecurityControlListType.WHITELIST
      : SecurityControlListType.BLACKLIST;
    const controlListCount =
      await this.queryAdapter.getControlListCount(securityEvmAddress);
    const controlListMembers = (
      await this.queryAdapter.getControlListMembers(
        securityEvmAddress,
        0,
        controlListCount,
      )
    ).map(function (x) {
      return x.toUpperCase();
    });

    if (await this.queryAdapter.isPaused(securityEvmAddress)) {
      throw new SecurityPaused();
    }

    if (
      controListType === SecurityControlListType.BLACKLIST &&
      controlListMembers.includes(account.evmAddress!.toString().toUpperCase())
    ) {
      throw new AccountInBlackList(account.evmAddress!.toString());
    }

    if (
      controListType === SecurityControlListType.WHITELIST &&
      !controlListMembers.includes(account.evmAddress!.toString().toUpperCase())
    ) {
      throw new AccountNotInWhiteList(account.evmAddress!.toString());
    }

    const security = await this.securityService.get(securityId);
    if (CheckNums.hasMoreDecimals(amount, security.decimals)) {
      throw new DecimalsOverRange(security.decimals);
    }

    const amountBd: BigDecimal = BigDecimal.fromString(
      amount,
      security.decimals,
    );
    if (
      account.evmAddress &&
      (
        await this.queryAdapter.balanceOf(
          securityEvmAddress,
          new EvmAddress(account.evmAddress),
        )
      ).lt(amountBd.toBigNumber())
    ) {
      throw new InsufficientBalance();
    }

    const res = await handler.redeem(securityEvmAddress, amountBd);
    return Promise.resolve(
      new RedeemCommandResponse(res.error === undefined, res.id!),
    );
  }
}
