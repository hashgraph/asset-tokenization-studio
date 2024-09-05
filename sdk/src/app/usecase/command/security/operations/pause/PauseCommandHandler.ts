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
import { PauseCommand, PauseCommandResponse } from './PauseCommand.js';
import TransactionService from '../../../../../service/TransactionService.js';
import { lazyInject } from '../../../../../../core/decorator/LazyInjectDecorator.js';
import EvmAddress from '../../../../../../domain/context/contract/EvmAddress.js';
import { HEDERA_FORMAT_ID_REGEX } from '../../../../../../domain/context/shared/HederaId.js';
import { MirrorNodeAdapter } from '../../../../../../port/out/mirror/MirrorNodeAdapter.js';
import { RPCQueryAdapter } from '../../../../../../port/out/rpc/RPCQueryAdapter.js';
import { SecurityRole } from '../../../../../../domain/context/security/SecurityRole.js';
import { NotGrantedRole } from '../../error/NotGrantedRole.js';
import { SecurityPaused } from '../../error/SecurityPaused.js';

@CommandHandler(PauseCommand)
export class PauseCommandHandler implements ICommandHandler<PauseCommand> {
  constructor(
    @lazyInject(SecurityService)
    public readonly securityService: SecurityService,
    @lazyInject(AccountService)
    public readonly accountService: AccountService,
    @lazyInject(TransactionService)
    public readonly transactionService: TransactionService,
    @lazyInject(MirrorNodeAdapter)
    private readonly mirrorNodeAdapter: MirrorNodeAdapter,
    @lazyInject(RPCQueryAdapter)
    private readonly rpcQueryAdapter: RPCQueryAdapter,
  ) {}

  async execute(command: PauseCommand): Promise<PauseCommandResponse> {
    const { securityId } = command;
    const handler = this.transactionService.getHandler();
    const account = this.accountService.getCurrentAccount();

    const securityEvmAddress: EvmAddress = new EvmAddress(
      HEDERA_FORMAT_ID_REGEX.test(securityId)
        ? (await this.mirrorNodeAdapter.getContractInfo(securityId)).evmAddress
        : securityId.toString(),
    );

    if (
      account.evmAddress &&
      !(await this.rpcQueryAdapter.hasRole(
        securityEvmAddress,
        new EvmAddress(account.evmAddress!),
        SecurityRole._PAUSER_ROLE,
      ))
    ) {
      throw new NotGrantedRole(SecurityRole._PAUSER_ROLE);
    }

    if (await this.rpcQueryAdapter.isPaused(securityEvmAddress)) {
      throw new SecurityPaused();
    }

    const res = await handler.pause(securityEvmAddress);
    return Promise.resolve(
      new PauseCommandResponse(res.error === undefined, res.id!),
    );
  }
}
