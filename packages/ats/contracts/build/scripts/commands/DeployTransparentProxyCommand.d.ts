import { BaseBlockchainCommand, BaseBlockchainCommandParams } from '../index';
interface DeployUpgradeableProxyCommandParams extends BaseBlockchainCommandParams {
    proxyAdminAddress: string;
    implementationAddress: string;
}
export default class DeployUpgradeableProxyCommand extends BaseBlockchainCommand {
    readonly proxyAdminAddress: string;
    readonly implementationAddress: string;
    constructor({ proxyAdminAddress, implementationAddress, signer, overrides, }: DeployUpgradeableProxyCommandParams);
}
export {};
