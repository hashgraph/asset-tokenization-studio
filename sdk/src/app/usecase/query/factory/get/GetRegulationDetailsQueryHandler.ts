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

import EvmAddress from '../../../../../domain/context/contract/EvmAddress.js';
import { lazyInject } from '../../../../../core/decorator/LazyInjectDecorator.js';
import { QueryHandler } from '../../../../../core/decorator/QueryHandlerDecorator.js';
import { IQueryHandler } from '../../../../../core/query/QueryHandler.js';
import { MirrorNodeAdapter } from '../../../../../port/out/mirror/MirrorNodeAdapter.js';
import { RPCQueryAdapter } from '../../../../../port/out/rpc/RPCQueryAdapter.js';
import {
  GetRegulationDetailsQuery,
  GetRegulationDetailsQueryResponse,
} from './GetRegulationDetailsQuery.js';
import { Regulation } from '../../../../../domain/context/factory/Regulation.js';
import { HEDERA_FORMAT_ID_REGEX } from '../../../../../domain/context/shared/HederaId.js';
import { InvalidRequest } from '../../error/InvalidRequest.js';

@QueryHandler(GetRegulationDetailsQuery)
export class GetRegulationDetailsQueryHandler
  implements IQueryHandler<GetRegulationDetailsQuery>
{
  constructor(
    @lazyInject(MirrorNodeAdapter)
    public readonly mirrorNodeAdapter: MirrorNodeAdapter,
    @lazyInject(RPCQueryAdapter)
    public readonly queryAdapter: RPCQueryAdapter,
  ) {}

  async execute(
    query: GetRegulationDetailsQuery,
  ): Promise<GetRegulationDetailsQueryResponse> {
    const { type, subType, factory } = query;

    if (!factory) {
      throw new InvalidRequest('Factory not found in request');
    }

    const factoryEvmAddress: EvmAddress = new EvmAddress(
      HEDERA_FORMAT_ID_REGEX.test(factory.toString())
        ? (await this.mirrorNodeAdapter.getContractInfo(factory.toString()))
            .evmAddress
        : factory.toString(),
    );

    const regulation: Regulation = await this.queryAdapter.getRegulationDetails(
      type,
      subType,
      factoryEvmAddress,
    );

    return Promise.resolve(new GetRegulationDetailsQueryResponse(regulation));
  }
}
