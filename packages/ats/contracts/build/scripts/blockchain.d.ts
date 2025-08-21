import { ValidateTxResponseCommand, ValidateTxResponseResult } from '@scripts';
export declare function validateTxResponse({ txResponse, confirmationEvent, confirmations, errorMessage, }: ValidateTxResponseCommand): Promise<ValidateTxResponseResult>;
export declare function validateTxResponseList(txResponseList: ValidateTxResponseCommand[]): Promise<ValidateTxResponseResult[]>;
