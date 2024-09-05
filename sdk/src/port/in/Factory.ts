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

import { QueryBus } from '../../core/query/QueryBus.js';
import Injectable from '../../core/Injectable.js';
import GetRegulationDetailsRequest from './request/GetRegulationDetailsRequest.js';
import { LogError } from '../../core/decorator/LogErrorDecorator.js';
import RegulationViewModel from './response/RegulationViewModel.js';
import { handleValidation } from './Common.js';
import { GetRegulationDetailsQuery } from '../../app/usecase/query/factory/get/GetRegulationDetailsQuery.js';
import ContractId from '../../domain/context/contract/ContractId.js';
import NetworkService from '../../app/service/NetworkService.js';

interface IFactoryInPort {
  getRegulationDetails(
    request: GetRegulationDetailsRequest,
  ): Promise<RegulationViewModel>;
}

class FactoryInPort implements IFactoryInPort {
  constructor(
    private readonly queryBus: QueryBus = Injectable.resolve(QueryBus),
    private readonly networkService: NetworkService = Injectable.resolve(
      NetworkService,
    ),
  ) {}

  @LogError
  async getRegulationDetails(
    request: GetRegulationDetailsRequest,
  ): Promise<RegulationViewModel> {
    handleValidation('GetRegulationDetailsRequest', request);

    const securityFactory = this.networkService.configuration.factoryAddress;

    const res = await this.queryBus.execute(
      new GetRegulationDetailsQuery(
        request.regulationType,
        request.regulationSubType,
        securityFactory ? new ContractId(securityFactory) : undefined,
      ),
    );

    const regulation = res.regulation;

    return {
      ...regulation,
    };
  }
}

const Factory = new FactoryInPort();
export default Factory;
