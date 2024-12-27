import { BaseContract, Contract, ContractReceipt } from 'ethers'

export default class DeployContractWithFactoryResult<C extends BaseContract> {
    public readonly address: string
    public readonly contract: C
    public readonly proxyAddress?: string
    public readonly proxyAdminAddress?: string
    public readonly receipt?: ContractReceipt

    constructor({
        address,
        contract,
        proxyAddress,
        proxyAdminAddress,
        receipt,
    }: {
        address: string
        contract: C
        proxyAddress?: string
        proxyAdminAddress?: string
        receipt?: ContractReceipt
    }) {
        this.address = address
        this.contract = contract
        this.proxyAddress = proxyAddress
        this.proxyAdminAddress = proxyAdminAddress
        this.receipt = receipt
    }
}
