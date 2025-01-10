import {
    BaseAtsContractListCommand,
    BaseAtsContractListCommandParams,
} from '../index'

interface RegisterBusinessLogicsCommandParams
    extends BaseAtsContractListCommandParams {}

export default class RegisterBusinessLogicsCommand extends BaseAtsContractListCommand {
    constructor({
        contractAddressList,
        businessLogicResolverProxyAddress,
        signer,
        overrides,
    }: RegisterBusinessLogicsCommandParams) {
        super({
            contractAddressList,
            businessLogicResolverProxyAddress,
            signer,
            overrides,
        })
    }

    get contractAddressListToRegister() {
        return this.contractAddressList
    }
}
