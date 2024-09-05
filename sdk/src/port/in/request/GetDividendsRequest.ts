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

import { MIN_ID } from '../../../domain/context/security/CorporateAction.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class GetDividendsRequest extends ValidatedRequest<GetDividendsRequest> {
  securityId: string;
  dividendId: number;

  constructor({
    securityId,
    dividendId,
  }: {
    securityId: string;
    dividendId: number;
  }) {
    super({
      securityId: Validation.checkHederaIdFormatOrEvmAddress(),
      dividendId: Validation.checkNumber({
        max: undefined,
        min: MIN_ID,
      }),
    });
    this.securityId = securityId;
    this.dividendId = dividendId;
  }
}
