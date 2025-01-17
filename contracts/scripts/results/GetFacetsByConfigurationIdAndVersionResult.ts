import { IDiamondLoupe } from '@typechain'

interface NewType {
    facetListRecord: Record<number, IDiamondLoupe.FacetStructOutput[]>
}

export default class GetFacetsByConfigurationIdAndVersionResult {
    public readonly facetListRecord: Record<
        number,
        IDiamondLoupe.FacetStructOutput[]
    >

    constructor({ facetListRecord }: NewType) {
        this.facetListRecord = facetListRecord
    }
}
