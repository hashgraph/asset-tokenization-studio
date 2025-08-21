import { Factory } from '@typechain';
import { CreateConfigurationsForDeployedContractsResult, DeployAtsContractsResult, DeployAtsContractsResultParams, DeployContractWithFactoryResult } from '../index';
interface DeployAtsFullInfrastructureResultParams extends DeployAtsContractsResultParams {
    factory: DeployContractWithFactoryResult<Factory>;
    facetLists: CreateConfigurationsForDeployedContractsResult;
}
export default class DeployAtsFullInfrastructureResult extends DeployAtsContractsResult {
    readonly factory: DeployContractWithFactoryResult<Factory>;
    readonly facetLists: CreateConfigurationsForDeployedContractsResult;
    constructor({ factory, facetLists, ...params }: DeployAtsFullInfrastructureResultParams);
}
export {};
