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

import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class LockRequest extends ValidatedRequest<LockRequest> {
  securityId: string;
  targetId: string;
  amount: string;
  expirationTimestamp: string;

  constructor({
    targetId,
    amount,
    securityId,
    expirationTimestamp,
  }: {
    targetId: string;
    amount: string;
    securityId: string;
    expirationTimestamp: string;
  }) {
    super({
      securityId: Validation.checkHederaIdFormatOrEvmAddress(),
      targetId: Validation.checkHederaIdFormatOrEvmAddress(),
      amount: Validation.checkAmount(),
    });

    this.securityId = securityId;
    this.targetId = targetId;
    this.amount = amount;
    this.expirationTimestamp = expirationTimestamp;
  }
}
