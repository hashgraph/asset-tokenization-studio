import { BusinessLogicResolver, Factory } from '@typechain';
import DeployAtsContractsResult from './results/DeployAtsContractsResult';
import DeployAtsFullInfrastructureResult from './results/DeployAtsFullInfrastructureResult';
interface NewEnvironmentParams {
    commonFacetIdList?: string[];
    equityFacetIdList?: string[];
    bondFacetIdList?: string[];
    equityFacetVersionList?: number[];
    bondFacetVersionList?: number[];
    businessLogicResolver?: BusinessLogicResolver;
    factory?: Factory;
    deployedContracts?: DeployAtsContractsResult;
}
export default class Environment {
    commonFacetIdList?: string[];
    equityFacetIdList?: string[];
    bondFacetIdList?: string[];
    equityFacetVersionList?: number[];
    bondFacetVersionList?: number[];
    businessLogicResolver?: BusinessLogicResolver;
    factory?: Factory;
    deployedContracts?: DeployAtsContractsResult;
    constructor({ commonFacetIdList, equityFacetIdList, bondFacetIdList, equityFacetVersionList, bondFacetVersionList, businessLogicResolver, factory, deployedContracts, }: NewEnvironmentParams);
    static empty(): Environment;
    toDeployAtsFullInfrastructureResult(): DeployAtsFullInfrastructureResult;
    get initialized(): boolean;
    private _validateInitialization;
}
export {};
