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

import { ICommandHandler } from '../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../core/decorator/CommandHandlerDecorator.js';
import { lazyInject } from '../../../../../core/decorator/LazyInjectDecorator.js';
import ContractId from '../../../../../domain/context/contract/ContractId.js';
import { Security } from '../../../../../domain/context/security/Security.js';
import AccountService from '../../../../service/AccountService.js';
import TransactionService from '../../../../service/TransactionService.js';
import NetworkService from '../../../../service/NetworkService.js';
import {
  CreateEquityCommand,
  CreateEquityCommandResponse,
} from './CreateEquityCommand.js';
import { InvalidRequest } from '../../error/InvalidRequest.js';
import { MirrorNodeAdapter } from '../../../../../port/out/mirror/MirrorNodeAdapter.js';
import { RPCQueryAdapter } from '../../../../../port/out/rpc/RPCQueryAdapter.js';
import EvmAddress from '../../../../../domain/context/contract/EvmAddress.js';
import { HEDERA_FORMAT_ID_REGEX } from '../../../../../domain/context/shared/HederaId.js';
import { EquityDetails } from '../../../../../domain/context/equity/EquityDetails.js';
import BigDecimal from '../../../../../domain/context/shared/BigDecimal.js';

@CommandHandler(CreateEquityCommand)
export class CreateEquityCommandHandler
  implements ICommandHandler<CreateEquityCommand>
{
  constructor(
    @lazyInject(AccountService)
    public readonly accountService: AccountService,
    @lazyInject(TransactionService)
    public readonly transactionService: TransactionService,
    @lazyInject(NetworkService)
    public readonly networkService: NetworkService,
    @lazyInject(MirrorNodeAdapter)
    public readonly mirrorNodeAdapter: MirrorNodeAdapter,
    @lazyInject(RPCQueryAdapter)
    public readonly queryAdapter: RPCQueryAdapter,
  ) {}

  async execute(
    command: CreateEquityCommand,
  ): Promise<CreateEquityCommandResponse> {
    const {
      security,
      factory,
      resolver,
      businessLogicKeys,
      diamondOwnerAccount,
      votingRight,
      informationRight,
      liquidationRight,
      subscriptionRight,
      convertionRight,
      redemptionRight,
      putRight,
      dividendRight,
      currency,
      nominalValue,
    } = command;

    if (!factory) {
      throw new InvalidRequest('Factory not found in request');
    }

    if (!resolver) {
      throw new InvalidRequest('Resolver not found in request');
    }

    if (!businessLogicKeys) {
      throw new InvalidRequest('Business Logic Keys not found in request');
    }

    const diamondOwnerAccountEvmAddress: EvmAddress =
      HEDERA_FORMAT_ID_REGEX.test(diamondOwnerAccount!)
        ? await this.mirrorNodeAdapter.accountToEvmAddress(diamondOwnerAccount!)
        : new EvmAddress(diamondOwnerAccount!);

    const factoryEvmAddress: EvmAddress = new EvmAddress(
      HEDERA_FORMAT_ID_REGEX.test(factory.toString())
        ? (await this.mirrorNodeAdapter.getContractInfo(factory.toString()))
            .evmAddress
        : factory.toString(),
    );

    const resolverEvmAddress: EvmAddress = new EvmAddress(
      HEDERA_FORMAT_ID_REGEX.test(resolver.toString())
        ? (await this.mirrorNodeAdapter.getContractInfo(resolver.toString()))
            .evmAddress
        : resolver.toString(),
    );
    const handler = this.transactionService.getHandler();

    const equityInfo = new EquityDetails(
      votingRight,
      informationRight,
      liquidationRight,
      subscriptionRight,
      convertionRight,
      redemptionRight,
      putRight,
      dividendRight,
      currency,
      BigDecimal.fromString(nominalValue),
    );

    const res = await handler.createEquity(
      new Security(security),
      equityInfo,
      factoryEvmAddress,
      resolverEvmAddress,
      businessLogicKeys,
      diamondOwnerAccountEvmAddress,
    );

    const equityId =
      await this.mirrorNodeAdapter.getHederaIdfromContractAddress(
        res.response.equityAddress,
      );

    try {
      return Promise.resolve(
        new CreateEquityCommandResponse(new ContractId(equityId), res.id!),
      );
    } catch (e) {
      if (res.response == 1)
        return Promise.resolve(
          new CreateEquityCommandResponse(new ContractId('0.0.0'), res.id!),
        );
      else throw e;
    }
  }
}
