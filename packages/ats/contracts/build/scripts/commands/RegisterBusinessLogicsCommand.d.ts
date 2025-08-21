import { BaseAtsContractListCommand, BaseAtsContractListCommandParams } from '../index';
type RegisterBusinessLogicsCommandParams = BaseAtsContractListCommandParams;
export default class RegisterBusinessLogicsCommand extends BaseAtsContractListCommand {
    constructor({ contractAddressList, businessLogicResolverProxyAddress, signer, overrides, }: RegisterBusinessLogicsCommandParams);
    get contractAddressListToRegister(): string[];
}
export {};
