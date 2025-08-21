interface CreateConfigurationsForDeployedContractsResultParams {
    commonFacetIdList: string[];
    equityFacetIdList: string[];
    bondFacetIdList: string[];
    equityFacetVersionList: number[];
    bondFacetVersionList: number[];
}
export default class CreateConfigurationsForDeployedContractsResult {
    commonFacetIdList: string[];
    equityFacetIdList: string[];
    bondFacetIdList: string[];
    equityFacetVersionList: number[];
    bondFacetVersionList: number[];
    constructor({ commonFacetIdList, equityFacetIdList, bondFacetIdList, equityFacetVersionList, bondFacetVersionList, }: CreateConfigurationsForDeployedContractsResultParams);
    static empty(): CreateConfigurationsForDeployedContractsResult;
}
export {};
