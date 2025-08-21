import { Contract, ContractReceipt } from 'ethers';
export default class DeployContractWithFactoryResult<C extends Contract> {
    readonly address: string;
    readonly contract: C;
    readonly proxyAddress?: string;
    readonly proxyAdminAddress?: string;
    readonly receipt?: ContractReceipt;
    constructor({ address, contract, proxyAddress, proxyAdminAddress, receipt, }: {
        address: string;
        contract: C;
        proxyAddress?: string;
        proxyAdminAddress?: string;
        receipt?: ContractReceipt;
    });
}
