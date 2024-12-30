import {
    TransactionReceiptError,
    ValidateTxResponseCommand,
    ValidateTxResponseResult,
} from './index'

export async function validateTxResponse({
    txResponse,
    confirmations,
    errorMessage,
}: ValidateTxResponseCommand): Promise<ValidateTxResponseResult> {
    const txReceipt = await txResponse.wait(confirmations)
    if (txReceipt.status === 0) {
        throw new TransactionReceiptError({
            errorMessage,
            txHash: txResponse.hash,
        })
    }
    return new ValidateTxResponseResult({
        txResponse,
        txReceipt,
    })
}
