interface TransactionReceiptErrorParams {
    errorMessage?: string;
    txHash?: string;
}
export default class TransactionReceiptError extends Error {
    constructor({ errorMessage, txHash }: TransactionReceiptErrorParams);
}
export {};
