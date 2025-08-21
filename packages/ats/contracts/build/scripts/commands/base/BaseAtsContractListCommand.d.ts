import { BaseBlockchainCommand, BaseBlockchainCommandParams } from '../../index';
export interface BaseAtsContractListCommandParams extends BaseBlockchainCommandParams {
    readonly contractAddressList: string[];
    readonly businessLogicResolverProxyAddress: string;
}
export default abstract class BaseAtsContractListCommand extends BaseBlockchainCommand {
    readonly contractAddressList: string[];
    readonly businessLogicResolverProxyAddress: string;
    constructor({ contractAddressList, businessLogicResolverProxyAddress, signer, overrides, }: BaseAtsContractListCommandParams);
}
