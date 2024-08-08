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
