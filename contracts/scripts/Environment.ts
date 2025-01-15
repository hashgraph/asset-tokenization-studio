import { DeployContractWithFactoryResult } from '.'
import { BusinessLogicResolver, Factory } from '../typechain-types'
import DeployAtsContractsResult from './results/DeployAtsContractsResult'
import DeployAtsFullInfrastructureResult from './results/DeployAtsFullInfrastructureResult'

interface NewEnvironmentParams {
    commonFacetIdList?: string[]
    equityFacetIdList?: string[]
    bondFacetIdList?: string[]
    equityFacetVersionList?: number[]
    bondFacetVersionList?: number[]
    businessLogicResolver?: BusinessLogicResolver
    factory?: Factory
    deployedContracts?: DeployAtsContractsResult
}

export default class Environment {
    public commonFacetIdList?: string[]
    public equityFacetIdList?: string[]
    public bondFacetIdList?: string[]
    public equityFacetVersionList?: number[]
    public bondFacetVersionList?: number[]
    public businessLogicResolver?: BusinessLogicResolver
    public factory?: Factory
    public deployedContracts?: DeployAtsContractsResult

    constructor({
        commonFacetIdList,
        equityFacetIdList,
        bondFacetIdList,
        equityFacetVersionList,
        bondFacetVersionList,
        businessLogicResolver,
        factory,
        deployedContracts,
    }: NewEnvironmentParams) {
        this.commonFacetIdList = commonFacetIdList
        this.equityFacetIdList = equityFacetIdList
        this.bondFacetIdList = bondFacetIdList
        this.equityFacetVersionList = equityFacetVersionList
        this.bondFacetVersionList = bondFacetVersionList
        this.businessLogicResolver = businessLogicResolver
        this.factory = factory
        this.deployedContracts = deployedContracts
    }

    public static empty(): Environment {
        return new Environment({})
    }

    public toDeployAtsFullInfrastructureResult(): DeployAtsFullInfrastructureResult {
        const {
            commonFacetIdList,
            equityFacetIdList,
            bondFacetIdList,
            equityFacetVersionList,
            bondFacetVersionList,
            factory,
            deployedContracts,
        } = this._validateInitialization()

        return new DeployAtsFullInfrastructureResult({
            facetLists: {
                commonFacetIdList,
                equityFacetIdList,
                bondFacetIdList,
                equityFacetVersionList,
                bondFacetVersionList,
            },
            factory: new DeployContractWithFactoryResult({
                address: factory.address,
                contract: factory,
            }),
            ...deployedContracts,
        })
    }

    public get initialized(): boolean {
        try {
            this._validateInitialization()
            return true
        } catch {
            return false
        }
    }

    private _validateInitialization() {
        if (
            !this.commonFacetIdList ||
            !this.equityFacetIdList ||
            !this.bondFacetIdList ||
            !this.equityFacetVersionList ||
            !this.bondFacetVersionList ||
            !this.businessLogicResolver ||
            !this.factory ||
            !this.deployedContracts
        ) {
            throw new Error('Environment must be initialized')
        }
        return {
            commonFacetIdList: this.commonFacetIdList,
            equityFacetIdList: this.equityFacetIdList,
            bondFacetIdList: this.bondFacetIdList,
            equityFacetVersionList: this.equityFacetVersionList,
            bondFacetVersionList: this.bondFacetVersionList,
            businessLogicResolver: this.businessLogicResolver,
            factory: this.factory,
            deployedContracts: this.deployedContracts,
        }
    }
}
