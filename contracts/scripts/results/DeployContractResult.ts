import { Contract, ContractReceipt } from 'ethers'
import { ContractName } from '../../Configuration'

export default class DeployContractResult {
    private _name: ContractName
    private _address: string
    private _contract: Contract
    private _proxyAddress?: string
    private _proxyAdminAddress?: string
    private _receipt: ContractReceipt

    constructor({
        name,
        address,
        contract,
        proxyAddress,
        proxyAdminAddress,
        receipt,
    }: {
        name: ContractName
        address: string
        contract: Contract
        proxyAddress?: string
        proxyAdminAddress?: string
        receipt: ContractReceipt
    }) {
        this._name = name
        this._address = address
        this._contract = contract
        this._proxyAddress = proxyAddress
        this._proxyAdminAddress = proxyAdminAddress
        this._receipt = receipt
    }

    public get name(): ContractName {
        return this._name
    }
    public get address(): string {
        return this._address
    }
    public get contract(): Contract {
        return this._contract
    }
    public get proxyAddress(): string | undefined {
        return this._proxyAddress
    }
    public get proxyAdminAddress(): string | undefined {
        return this._proxyAdminAddress
    }
    public get receipt(): ContractReceipt {
        return this._receipt
    }
}
