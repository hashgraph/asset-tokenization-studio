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

/* eslint-disable @typescript-eslint/no-explicit-any */
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';
import { SecurityRole } from '../../../domain/context/security/SecurityRole.js';
import { InvalidValue } from './error/InvalidValue.js';

export default class ApplyRolesRequest extends ValidatedRequest<ApplyRolesRequest> {
  securityId: string;
  targetId: string;
  roles: SecurityRole[];
  actives: boolean[];

  constructor({
    targetId,
    securityId,
    roles,
    actives,
  }: {
    targetId: string;
    securityId: string;
    roles: SecurityRole[];
    actives: boolean[];
  }) {
    super({
      securityId: Validation.checkHederaIdFormatOrEvmAddress(),
      targetId: Validation.checkHederaIdFormatOrEvmAddress(),
      roles: (vals) => {
        if (vals.length == 0) {
          return [new InvalidValue(`The list of roles cannot be empty.`)];
        }

        for (let i = 0; i < vals.length; i++) {
          const err = Validation.checkRole()(vals[i]);
          if (err.length > 0) {
            return err;
          }
          if (vals.indexOf(vals[i]) != i) {
            return [new InvalidValue(`role ${vals[i]} is duplicated`)];
          }
        }
      },
      actives: (vals) => {
        if (vals.length != this.roles.length) {
          return [
            new InvalidValue(
              `The list of roles and actives must have equal length.`,
            ),
          ];
        }
      },
    });
    this.securityId = securityId;
    this.targetId = targetId;
    this.roles = roles;
    this.actives = actives;
  }
}
