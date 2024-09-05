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
import {
  ControllerRedeemCommand,
  ControllerRedeemCommandResponse,
} from './ControllerRedeemCommand.js';
import TransactionService from '../../../../../service/TransactionService.js';
import { lazyInject } from '../../../../../../core/decorator/LazyInjectDecorator.js';
import BigDecimal from '../../../../../../domain/context/shared/BigDecimal.js';
import CheckNums from '../../../../../../core/checks/numbers/CheckNums.js';
import { DecimalsOverRange } from '../../error/DecimalsOverRange.js';
import { HEDERA_FORMAT_ID_REGEX } from '../../../../../../domain/context/shared/HederaId.js';
import EvmAddress from '../../../../../../domain/context/contract/EvmAddress.js';
import { MirrorNodeAdapter } from '../../../../../../port/out/mirror/MirrorNodeAdapter.js';
import { RPCQueryAdapter } from '../../../../../../port/out/rpc/RPCQueryAdapter.js';
import { SecurityPaused } from '../../error/SecurityPaused.js';
import { InsufficientBalance } from '../../error/InsufficientBalance.js';
import { NotGrantedRole } from '../../error/NotGrantedRole.js';
import { SecurityRole } from '../../../../../../domain/context/security/SecurityRole.js';

@CommandHandler(ControllerRedeemCommand)
export class ControllerRedeemCommandHandler
  implements ICommandHandler<ControllerRedeemCommand>
{
  constructor(
    @lazyInject(SecurityService)
    public readonly securityService: SecurityService,
    @lazyInject(AccountService)
    public readonly accountService: AccountService,
    @lazyInject(TransactionService)
    public readonly transactionService: TransactionService,
    @lazyInject(RPCQueryAdapter)
    public readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(MirrorNodeAdapter)
    private readonly mirrorNodeAdapter: MirrorNodeAdapter,
  ) {}

  async execute(
    command: ControllerRedeemCommand,
  ): Promise<ControllerRedeemCommandResponse> {
    const { securityId, amount, sourceId } = command;
    const handler = this.transactionService.getHandler();
    const account = this.accountService.getCurrentAccount();
    const security = await this.securityService.get(securityId);

    const securityEvmAddress: EvmAddress = new EvmAddress(
      HEDERA_FORMAT_ID_REGEX.test(securityId)
        ? (await this.mirrorNodeAdapter.getContractInfo(securityId)).evmAddress
        : securityId.toString(),
    );

    if (await this.queryAdapter.isPaused(securityEvmAddress)) {
      throw new SecurityPaused();
    }

    if (
      account.evmAddress &&
      !(await this.queryAdapter.hasRole(
        securityEvmAddress,
        new EvmAddress(account.evmAddress!),
        SecurityRole._CONTROLLER_ROLE,
      ))
    ) {
      throw new NotGrantedRole(SecurityRole._CONTROLLER_ROLE);
    }

    if (CheckNums.hasMoreDecimals(amount, security.decimals)) {
      throw new DecimalsOverRange(security.decimals);
    }

    const sourceEvmAddress: EvmAddress = HEDERA_FORMAT_ID_REGEX.exec(sourceId)
      ? await this.mirrorNodeAdapter.accountToEvmAddress(sourceId)
      : new EvmAddress(sourceId);

    const amountBd = BigDecimal.fromString(amount, security.decimals);

    if (
      account.evmAddress &&
      (
        await this.queryAdapter.balanceOf(securityEvmAddress, sourceEvmAddress)
      ).lt(amountBd.toBigNumber())
    ) {
      throw new InsufficientBalance();
    }

    const res = await handler.controllerRedeem(
      securityEvmAddress,
      sourceEvmAddress,
      amountBd,
    );
    return Promise.resolve(
      new ControllerRedeemCommandResponse(res.error === undefined, res.id!),
    );
  }
}
