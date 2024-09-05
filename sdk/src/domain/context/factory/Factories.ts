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
import { Environment } from '../network/Environment.js';
import {
  CheckRegulations,
  RegulationSubType,
  RegulationType,
} from './RegulationType.js';
import {
  InvalidRegulationSubType,
  InvalidRegulationSubTypeForType,
} from './error/InvalidRegulationSubType.js';
import { InvalidRegulationType } from './error/InvalidRegulationType.js';

export class EnvironmentFactory {
  factory: string;
  environment: Environment;

  constructor(factory: string, environment: Environment) {
    this.factory = factory;
    this.environment = environment;
  }
}

export class Factories {
  factories: EnvironmentFactory[];

  constructor(factories: EnvironmentFactory[]) {
    this.factories = factories;
  }
}

export class Factory {
  public static checkRegulationType(value: number): BaseError[] {
    const errorList: BaseError[] = [];

    const length = Object.keys(RegulationType).length;

    if (value >= length) errorList.push(new InvalidRegulationType(value));

    return errorList;
  }

  public static checkRegulationSubType(
    value: number,
    type: number,
  ): BaseError[] {
    const errorList: BaseError[] = [];

    const length = Object.keys(RegulationSubType).length;

    if (value >= length) errorList.push(new InvalidRegulationSubType(value));

    if (!CheckRegulations.typeAndSubtype(type, value))
      errorList.push(new InvalidRegulationSubTypeForType(value, type));

    return errorList;
  }
}
