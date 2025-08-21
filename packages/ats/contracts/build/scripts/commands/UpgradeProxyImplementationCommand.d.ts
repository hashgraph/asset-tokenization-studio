import { BaseBlockchainCommand, BaseBlockchainCommandParams } from '../index';
interface UpgradeProxyImplementationCommandParams extends BaseBlockchainCommandParams {
    proxyAdminAddress: string;
    transparentProxyAddress: string;
    newImplementationAddress: string;
}
export default class UpgradeProxyImplementationCommand extends BaseBlockchainCommand {
    readonly proxyAdminAddress: string;
    readonly transparentProxyAddress: string;
    readonly newImplementationAddress: string;
    constructor({ proxyAdminAddress, transparentProxyAddress, newImplementationAddress, signer, overrides, }: UpgradeProxyImplementationCommandParams);
}
export {};
