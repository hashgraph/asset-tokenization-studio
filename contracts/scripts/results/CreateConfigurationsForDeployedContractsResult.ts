interface CreateConfigurationsForDeployedContractsResultParams {
    commonFacetIdList: string[]
    equityFacetIdList: string[]
    bondFacetIdList: string[]
    equityFacetVersionList: number[]
    bondFacetVersionList: number[]
}

export default class CreateConfigurationsForDeployedContractsResult {
    public commonFacetIdList: string[]
    public equityFacetIdList: string[]
    public bondFacetIdList: string[]
    public equityFacetVersionList: number[]
    public bondFacetVersionList: number[]

    constructor({
        commonFacetIdList,
        equityFacetIdList,
        bondFacetIdList,
        equityFacetVersionList,
        bondFacetVersionList,
    }: CreateConfigurationsForDeployedContractsResultParams) {
        this.commonFacetIdList = commonFacetIdList
        this.equityFacetIdList = equityFacetIdList
        this.equityFacetVersionList = equityFacetVersionList
        this.bondFacetIdList = bondFacetIdList
        this.bondFacetVersionList = bondFacetVersionList
    }

    public static empty(): CreateConfigurationsForDeployedContractsResult {
        return new CreateConfigurationsForDeployedContractsResult({
            commonFacetIdList: [],
            equityFacetIdList: [],
            bondFacetIdList: [],
            equityFacetVersionList: [],
            bondFacetVersionList: [],
        })
    }
}
