import { ContractReceipt, ContractTransaction } from 'ethers';
interface ValidateTxResponseResultParams {
    txResponse: ContractTransaction;
    txReceipt: ContractReceipt;
}
export default class ValidateTxResponseResult {
    readonly txResponse: ContractTransaction;
    readonly txReceipt: ContractReceipt;
    constructor({ txResponse, txReceipt }: ValidateTxResponseResultParams);
}
export {};
