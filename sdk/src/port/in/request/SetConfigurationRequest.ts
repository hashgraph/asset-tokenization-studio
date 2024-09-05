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
import Configuration from '../../../domain/context/network/Configuration.js';
import { InvalidValue } from './error/InvalidValue.js';

export default class SetConfigurationRequest extends ValidatedRequest<SetConfigurationRequest> {
  factoryAddress: string;
  resolverAddress: string;
  businessLogicKeysCommon: string[];
  businessLogicKeysEquity: string[];
  businessLogicKeysBond: string[];

  constructor(props: Configuration) {
    super({
      factoryAddress: Validation.checkContractId(),
      resolverAddress: Validation.checkContractId(),
      businessLogicKeysCommon: (vals) => {
        if (vals.length == 0) {
          return [
            new InvalidValue(
              `The list of business logic keys Common cannot be empty.`,
            ),
          ];
        }

        for (let i = 0; i < vals.length; i++) {
          const err = Validation.checkBytes32Format()(vals[i]);
          if (err.length > 0) {
            return err;
          }
          if (vals.indexOf(vals[i]) != i) {
            return [
              new InvalidValue(`business logic key ${vals[i]} is duplicated`),
            ];
          }
        }
      },
      businessLogicKeysEquity: (vals) => {
        if (vals.length == 0) {
          return [
            new InvalidValue(
              `The list of business logic keys Equity cannot be empty.`,
            ),
          ];
        }

        for (let i = 0; i < vals.length; i++) {
          const err = Validation.checkBytes32Format()(vals[i]);
          if (err.length > 0) {
            return err;
          }
          if (vals.indexOf(vals[i]) != i) {
            return [
              new InvalidValue(`business logic key ${vals[i]} is duplicated`),
            ];
          }
        }
      },
      businessLogicKeysBond: (vals) => {
        if (vals.length == 0) {
          return [
            new InvalidValue(
              `The list of business logic keys Bond cannot be empty.`,
            ),
          ];
        }

        for (let i = 0; i < vals.length; i++) {
          const err = Validation.checkBytes32Format()(vals[i]);
          if (err.length > 0) {
            return err;
          }
          if (vals.indexOf(vals[i]) != i) {
            return [
              new InvalidValue(`business logic key ${vals[i]} is duplicated`),
            ];
          }
        }
      },
    });
    this.factoryAddress = props.factoryAddress;
    this.resolverAddress = props.resolverAddress;
    this.businessLogicKeysCommon = props.businessLogicKeysCommon;
    this.businessLogicKeysEquity = props.businessLogicKeysEquity;
    this.businessLogicKeysBond = props.businessLogicKeysBond;
  }
}
