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
import { SecurityDate } from '../../../domain/context/shared/SecurityDate.js';

export default class SetVotingRightsRequest extends ValidatedRequest<SetVotingRightsRequest> {
  securityId: string;
  recordTimestamp: string;
  data: string;

  constructor({
    securityId,
    recordTimestamp,
    data,
  }: {
    securityId: string;
    recordTimestamp: string;
    data: string;
  }) {
    super({
      recordTimestamp: (val) => {
        return SecurityDate.checkDateTimestamp(
          parseInt(val),
          Math.ceil(new Date().getTime() / 1000),
          undefined,
        );
      },
      securityId: Validation.checkHederaIdFormatOrEvmAddress(),
      data: Validation.checkBytesFormat(),
    });

    this.securityId = securityId;
    this.recordTimestamp = recordTimestamp;
    this.data = data;
  }
}
