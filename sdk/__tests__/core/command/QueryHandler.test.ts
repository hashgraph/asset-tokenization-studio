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

/* eslint-disable jest/no-mocks-import */
import { QueryBus } from '../../../src/core/query/QueryBus.js';
import {
  ConcreteQuery,
  ConcreteQueryResponse,
} from './__mocks__/ConcreteQueryHandler.js';

const queryBus = new QueryBus();

describe('🧪 QueryHandler Test', () => {
  it('Executes a simple query', async () => {
    const execSpy = jest.spyOn(queryBus, 'execute');
    const query = new ConcreteQuery('1', 4);
    const res = await queryBus.execute(query);
    expect(res).toBeInstanceOf(ConcreteQueryResponse);
    expect(res.payload).toBe(query.payload);
    expect(execSpy).toHaveBeenCalled();
  });
});
