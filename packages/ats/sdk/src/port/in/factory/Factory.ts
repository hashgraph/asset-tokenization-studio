// SPDX-License-Identifier: Apache-2.0

import { QueryBus } from "@core/query/QueryBus";
import Injectable from "@core/injectable/Injectable";
import GetRegulationDetailsRequest from "../request/factory/GetRegulationDetailsRequest";
import { LogError } from "@core/decorator/LogErrorDecorator";
import RegulationViewModel from "../response/RegulationViewModel";
import ValidatedRequest from "@core/validation/ValidatedArgs";

import { GetRegulationDetailsQuery } from "@query/factory/get/GetRegulationDetailsQuery";
import ContractId from "@domain/context/contract/ContractId";
import NetworkService from "@service/network/NetworkService";

interface IFactoryInPort {
  getRegulationDetails(request: GetRegulationDetailsRequest): Promise<RegulationViewModel>;
}

class FactoryInPort implements IFactoryInPort {
  constructor(
    private readonly queryBus: QueryBus = Injectable.resolve(QueryBus),
    private readonly networkService: NetworkService = Injectable.resolve(NetworkService),
  ) {}

  @LogError
  async getRegulationDetails(request: GetRegulationDetailsRequest): Promise<RegulationViewModel> {
    ValidatedRequest.handleValidation("GetRegulationDetailsRequest", request);

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
