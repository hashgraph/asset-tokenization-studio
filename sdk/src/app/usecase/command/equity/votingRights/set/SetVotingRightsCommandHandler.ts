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
import {
  SetVotingRightsCommand,
  SetVotingRightsCommandResponse,
} from './SetVotingRightsCommand.js';
import TransactionService from '../../../../../service/TransactionService.js';
import { lazyInject } from '../../../../../../core/decorator/LazyInjectDecorator.js';
import { HEDERA_FORMAT_ID_REGEX } from '../../../../../../domain/context/shared/HederaId.js';
import EvmAddress from '../../../../../../domain/context/contract/EvmAddress.js';
import { MirrorNodeAdapter } from '../../../../../../port/out/mirror/MirrorNodeAdapter.js';
import BigDecimal from '../../../../../../domain/context/shared/BigDecimal.js';

@CommandHandler(SetVotingRightsCommand)
export class SetVotingRightsCommandHandler
  implements ICommandHandler<SetVotingRightsCommand>
{
  constructor(
    @lazyInject(TransactionService)
    public readonly transactionService: TransactionService,
    @lazyInject(MirrorNodeAdapter)
    private readonly mirrorNodeAdapter: MirrorNodeAdapter,
  ) {}

  async execute(
    command: SetVotingRightsCommand,
  ): Promise<SetVotingRightsCommandResponse> {
    const { address, recordDate, data } = command;
    const handler = this.transactionService.getHandler();

    const securityEvmAddress: EvmAddress = new EvmAddress(
      HEDERA_FORMAT_ID_REGEX.exec(address)
        ? (await this.mirrorNodeAdapter.getContractInfo(address)).evmAddress
        : address,
    );

    const res = await handler.setVotingRights(
      securityEvmAddress,
      BigDecimal.fromString(recordDate),
      data,
    );

    return Promise.resolve(
      new SetVotingRightsCommandResponse(res.response, res.id!),
    );
  }
}
