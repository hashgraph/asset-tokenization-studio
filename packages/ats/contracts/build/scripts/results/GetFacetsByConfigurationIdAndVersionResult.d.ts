import { IDiamondLoupe } from '@typechain';
interface NewType {
    facetListRecord: Record<number, IDiamondLoupe.FacetStructOutput[]>;
}
export default class GetFacetsByConfigurationIdAndVersionResult {
    readonly facetListRecord: Record<number, IDiamondLoupe.FacetStructOutput[]>;
    constructor({ facetListRecord }: NewType);
}
export {};
