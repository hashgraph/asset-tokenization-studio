import { Factory } from '../../typechain-types'
import {
    CreateConfigurationsForDeployedContractsResult,
    DeployAtsContractsResult,
    DeployAtsContractsResultParams,
    DeployContractWithFactoryResult,
} from '../index'

interface DeployAtsFullInfrastructureResultParams
    extends DeployAtsContractsResultParams {
    factory: DeployContractWithFactoryResult<Factory>
    facetLists: CreateConfigurationsForDeployedContractsResult
}

export default class DeployAtsFullInfrastructureResult extends DeployAtsContractsResult {
    public readonly factory: DeployContractWithFactoryResult<Factory>
    public readonly facetLists: CreateConfigurationsForDeployedContractsResult

    constructor({
        factory,
        facetLists,
        ...params
    }: DeployAtsFullInfrastructureResultParams) {
        super(params)
        this.factory = factory
        this.facetLists = facetLists
    }
}
