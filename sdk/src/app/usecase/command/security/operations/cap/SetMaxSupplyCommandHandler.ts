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
import SecurityService from '../../../../../service/SecurityService.js';
import {
  SetMaxSupplyCommand,
  SetMaxSupplyCommandResponse,
} from './SetMaxSupplyCommand.js';
import TransactionService from '../../../../../service/TransactionService.js';
import { lazyInject } from '../../../../../../core/decorator/LazyInjectDecorator.js';
import BigDecimal from '../../../../../../domain/context/shared/BigDecimal.js';
import CheckNums from '../../../../../../core/checks/numbers/CheckNums.js';
import { DecimalsOverRange } from '../../error/DecimalsOverRange.js';
import { HEDERA_FORMAT_ID_REGEX } from '../../../../../../domain/context/shared/HederaId.js';
import { MirrorNodeAdapter } from '../../../../../../port/out/mirror/MirrorNodeAdapter.js';
import EvmAddress from '../../../../../../domain/context/contract/EvmAddress.js';

@CommandHandler(SetMaxSupplyCommand)
export class SetMaxSupplyCommandHandler
  implements ICommandHandler<SetMaxSupplyCommand>
{
  constructor(
    @lazyInject(SecurityService)
    public readonly securityService: SecurityService,
    @lazyInject(TransactionService)
    public readonly transactionService: TransactionService,
    @lazyInject(MirrorNodeAdapter)
    private readonly mirrorNodeAdapter: MirrorNodeAdapter,
  ) {}

  async execute(
    command: SetMaxSupplyCommand,
  ): Promise<SetMaxSupplyCommandResponse> {
    const { securityId, maxSupply } = command;
    const handler = this.transactionService.getHandler();

    const securityEvmAddress: EvmAddress = new EvmAddress(
      HEDERA_FORMAT_ID_REGEX.test(securityId)
        ? (await this.mirrorNodeAdapter.getContractInfo(securityId)).evmAddress
        : securityId.toString(),
    );

    const security = await this.securityService.get(securityId);
    if (CheckNums.hasMoreDecimals(maxSupply, security.decimals)) {
      throw new DecimalsOverRange(security.decimals);
    }

    const maxSupplyBd: BigDecimal = BigDecimal.fromString(
      maxSupply,
      security.decimals,
    );

    const res = await handler.setMaxSupply(securityEvmAddress, maxSupplyBd);
    return Promise.resolve(
      new SetMaxSupplyCommandResponse(res.error === undefined, res.id!),
    );
  }
}
