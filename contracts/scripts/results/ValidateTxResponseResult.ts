import { ContractReceipt, ContractTransaction } from 'ethers'

interface ValidateTxResponseResultParams {
    txResponse: ContractTransaction
    txReceipt: ContractReceipt
}

export default class ValidateTxResponseResult {
    public readonly txResponse: ContractTransaction
    public readonly txReceipt: ContractReceipt

    constructor({ txResponse, txReceipt }: ValidateTxResponseResultParams) {
        this.txResponse = txResponse
        this.txReceipt = txReceipt
    }
}
