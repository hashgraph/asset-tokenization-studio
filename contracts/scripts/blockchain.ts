import {
    TransactionReceiptError,
    ValidateTxResponseCommand,
    ValidateTxResponseResult,
} from '@scripts'

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

export async function validateTxResponseList(
    txResponseList: ValidateTxResponseCommand[]
): Promise<ValidateTxResponseResult[]> {
    return Promise.all(
        txResponseList.map(async (txResponse) => {
            return await validateTxResponse(txResponse)
        })
    )
}
