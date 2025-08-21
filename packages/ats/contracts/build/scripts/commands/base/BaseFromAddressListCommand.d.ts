import { Signer } from 'ethers';
export interface BaseAtsContractListCommandParams {
    readonly contractAddressList: string[];
    readonly businessLogicResolverProxyAddress: string;
    readonly equityUsaAddress?: string;
    readonly bondUsaAddress?: string;
    readonly signer: Signer;
}
export default abstract class BaseAtsContractListCommand {
    readonly contractAddressList: string[];
    readonly businessLogicResolverProxyAddress: string;
    readonly equityUsaAddress?: string;
    readonly bondUsaAddress?: string;
    readonly signer: Signer;
    constructor({ contractAddressList, businessLogicResolverProxyAddress, equityUsaAddress, bondUsaAddress, signer, }: BaseAtsContractListCommandParams);
}
