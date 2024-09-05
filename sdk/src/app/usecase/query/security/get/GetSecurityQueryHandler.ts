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

import { Security } from '../../../../../domain/context/security/Security.js';
import { lazyInject } from '../../../../../core/decorator/LazyInjectDecorator.js';
import { QueryHandler } from '../../../../../core/decorator/QueryHandlerDecorator.js';
import { IQueryHandler } from '../../../../../core/query/QueryHandler.js';
import { MirrorNodeAdapter } from '../../../../../port/out/mirror/MirrorNodeAdapter.js';
import { RPCQueryAdapter } from '../../../../../port/out/rpc/RPCQueryAdapter.js';
import {
  GetSecurityQuery,
  GetSecurityQueryResponse,
} from './GetSecurityQuery.js';
import EvmAddress from '../../../../../domain/context/contract/EvmAddress.js';
import { HEDERA_FORMAT_ID_REGEX } from '../../../../../domain/context/shared/HederaId.js';
import BigDecimal from '../../../../../domain/context/shared/BigDecimal.js';

@QueryHandler(GetSecurityQuery)
export class GetSecurityQueryHandler
  implements IQueryHandler<GetSecurityQuery>
{
  constructor(
    @lazyInject(MirrorNodeAdapter)
    public readonly mirrorNodeAdapter: MirrorNodeAdapter,
    @lazyInject(RPCQueryAdapter)
    public readonly queryAdapter: RPCQueryAdapter,
  ) {}

  async execute(query: GetSecurityQuery): Promise<GetSecurityQueryResponse> {
    const { securityId } = query;

    const securityEvmAddress: EvmAddress = new EvmAddress(
      HEDERA_FORMAT_ID_REGEX.test(securityId)
        ? (await this.mirrorNodeAdapter.getContractInfo(securityId)).evmAddress
        : securityId.toString(),
    );

    const security: Security =
      await this.queryAdapter.getSecurity(securityEvmAddress);
    if (!security.evmDiamondAddress)
      throw new Error('Invalid security address');

    if (security.maxSupply)
      security.maxSupply = BigDecimal.fromStringFixed(
        security.maxSupply.toString(),
        security.decimals,
      );
    if (security.totalSupply)
      security.totalSupply = BigDecimal.fromStringFixed(
        security.totalSupply.toString(),
        security.decimals,
      );

    return Promise.resolve(new GetSecurityQueryResponse(security));
  }
}
