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

import BaseError from '../../../core/error/BaseError.js';
import InvalidTimestampRange from './error/InvalidTimestampRange.js';

export const ONE_THOUSAND = 1000;

export class SecurityDate {
  public static checkDateTimestamp(
    value: number,
    minTimeStamp?: number,
    maxTimeStamp?: number,
  ): BaseError[] {
    const errorList: BaseError[] = [];

    const minDate = minTimeStamp ? minTimeStamp : 0;
    const maxDate = maxTimeStamp ? maxTimeStamp : 0;

    if (value < minDate || (maxTimeStamp && value > maxDate)) {
      errorList.push(
        new InvalidTimestampRange(
          new Date(value),
          new Date(minDate),
          new Date(maxDate),
        ),
      );
    }

    return errorList;
  }
}
