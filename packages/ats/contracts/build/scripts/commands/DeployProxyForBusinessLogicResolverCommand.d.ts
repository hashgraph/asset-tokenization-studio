import { BaseBlockchainCommand, BaseBlockchainCommandParams } from '../index';
interface DeployProxyForBusinessLogicResolverCommandParams extends BaseBlockchainCommandParams {
    businessLogicResolverImplementationAddress: string;
    proxyAdminAddress?: string;
}
export default class DeployProxyForBusinessLogicResolverCommand extends BaseBlockchainCommand {
    businessLogicResolverImplementationAddress: string;
    proxyAdminAddress?: string;
    constructor({ businessLogicResolverImplementationAddress, proxyAdminAddress, signer, overrides, }: DeployProxyForBusinessLogicResolverCommandParams);
}
export {};
