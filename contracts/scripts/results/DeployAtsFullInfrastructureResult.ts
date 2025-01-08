import { Signer } from 'ethers'
import { Factory } from '../../typechain-types'
import {
    DeployAtsContractsResult,
    DeployAtsContractsResultParams,
    DeployContractWithFactoryResult,
} from '../index'

interface DeployAtsFullInfrastructureResultParams
    extends DeployAtsContractsResultParams {
    factory: DeployContractWithFactoryResult<Factory>
}

export default class DeployAtsFullInfrastructureResult extends DeployAtsContractsResult {
    public readonly factory: DeployContractWithFactoryResult<Factory>

    constructor({
        factory,
        ...params
    }: DeployAtsFullInfrastructureResultParams) {
        super(params)
        this.factory = factory
    }
}
