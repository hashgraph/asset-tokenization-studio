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

import { QueryHandler } from '../../../../../../core/decorator/QueryHandlerDecorator.js';
import { IQueryHandler } from '../../../../../../core/query/QueryHandler.js';
import { RPCQueryAdapter } from '../../../../../../port/out/rpc/RPCQueryAdapter.js';
import { lazyInject } from '../../../../../../core/decorator/LazyInjectDecorator.js';
import { MirrorNodeAdapter } from '../../../../../../port/out/mirror/MirrorNodeAdapter.js';
import {
  GetBondDetailsQuery,
  GetBondDetailsQueryResponse,
} from './GetBondDetailsQuery.js';
import { HEDERA_FORMAT_ID_REGEX } from '../../../../../../domain/context/shared/HederaId.js';
import EvmAddress from '../../../../../../domain/context/contract/EvmAddress.js';
import { BondDetails } from '../../../../../../domain/context/bond/BondDetails.js';

@QueryHandler(GetBondDetailsQuery)
export class GetBondDetailsQueryHandler
  implements IQueryHandler<GetBondDetailsQuery>
{
  constructor(
    @lazyInject(MirrorNodeAdapter)
    public readonly mirrorNodeAdapter: MirrorNodeAdapter,
    @lazyInject(RPCQueryAdapter)
    public readonly queryAdapter: RPCQueryAdapter,
  ) {}

  async execute(
    query: GetBondDetailsQuery,
  ): Promise<GetBondDetailsQueryResponse> {
    const { bondId } = query;

    const bondEvmAddress: EvmAddress = new EvmAddress(
      HEDERA_FORMAT_ID_REGEX.exec(bondId)
        ? (await this.mirrorNodeAdapter.getContractInfo(bondId)).evmAddress
        : bondId,
    );

    const bond: BondDetails =
      await this.queryAdapter.getBondDetails(bondEvmAddress);

    return Promise.resolve(new GetBondDetailsQueryResponse(bond));
  }
}
