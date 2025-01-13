import { IDiamondLoupe } from '../../typechain-types'

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
