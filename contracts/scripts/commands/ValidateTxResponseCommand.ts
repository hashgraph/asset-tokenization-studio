import { ContractTransaction } from 'ethers'
import { ErrorMessageCommand } from '../index'

interface ValidateTxResponseCommandParams {
    txResponse: ContractTransaction
    confirmations?: number
    errorMessage?: string
}

export default class ValidateTxResponseCommand extends ErrorMessageCommand {
    public readonly txResponse: ContractTransaction
    public readonly confirmations: number

    constructor({
        txResponse,
        confirmations = 1,
        errorMessage,
    }: ValidateTxResponseCommandParams) {
        super({ errorMessage })
        this.txResponse = txResponse
        this.confirmations = confirmations
    }
}
