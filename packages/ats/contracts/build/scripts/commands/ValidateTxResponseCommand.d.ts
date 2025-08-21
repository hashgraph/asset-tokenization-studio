import { ContractTransaction } from 'ethers';
import { ErrorMessageCommand } from '../index';
interface ValidateTxResponseCommandParams {
    txResponse: ContractTransaction;
    confirmationEvent?: string;
    confirmations?: number;
    errorMessage?: string;
}
export default class ValidateTxResponseCommand extends ErrorMessageCommand {
    readonly txResponse: ContractTransaction;
    readonly confirmationEvent?: string;
    readonly confirmations: number;
    constructor({ txResponse, confirmationEvent, confirmations, errorMessage, }: ValidateTxResponseCommandParams);
}
export {};
