import {
    TransactionReceiptError,
    ValidateTxResponseCommand,
    ValidateTxResponseResult,
} from './index'

export async function validateTxResponse({
    txResponse,
    confirmationEvent,
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
    if (confirmationEvent) {
        const eventFound = txReceipt.events?.filter((event) => {
            return event.event === confirmationEvent
        })
        if (!eventFound || eventFound.length === 0) {
            throw new TransactionReceiptError({
                errorMessage,
                txHash: txResponse.hash,
            })
        }
    }
    return new ValidateTxResponseResult({
        txResponse,
        txReceipt,
    })
}
