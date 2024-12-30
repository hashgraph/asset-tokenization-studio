import { DeployAtsContractsResult } from '../index'
export default class DeployAtsFullInfrastructureResult {
    public readonly deployedContracts: DeployAtsContractsResult

    constructor({
        deployedContracts,
    }: {
        deployedContracts: DeployAtsContractsResult
    }) {
        this.deployedContracts = deployedContracts
    }
}
