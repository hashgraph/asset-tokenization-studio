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

import { singleton } from 'tsyringe';
import Injectable from '../../core/Injectable.js';
import AccountService from './AccountService.js';
import Service from './Service.js';
import { QueryBus } from '../../core/query/QueryBus.js';
import { Security } from '../../domain/context/security/Security.js';
import { GetSecurityQuery } from '../usecase/query/security/get/GetSecurityQuery.js';
import { SecurityNotFound } from '../../port/out/error/SecurityNotFound.js';

@singleton()
export default class SecurityService extends Service {
  queryBus: QueryBus;
  constructor(
    public readonly accountService: AccountService = Injectable.resolve<AccountService>(
      AccountService,
    ),
  ) {
    super();
  }

  async get(securityId: string): Promise<Security> {
    this.queryBus = Injectable.resolve<QueryBus>(QueryBus);
    const viewModel = (
      await this.queryBus.execute(new GetSecurityQuery(securityId))
    ).security;
    const { name, decimals, symbol, isin } = viewModel;
    if (!name || decimals === undefined || !symbol || !isin)
      throw new SecurityNotFound(securityId);

    return new Security({
      ...viewModel,
      name,
      decimals,
      symbol,
      isin,
    });
  }
}
