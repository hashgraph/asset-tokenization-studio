import { Result } from 'ethers/lib/utils';
import { CallContractCommand } from '@scripts';
import { TransactionReceipt } from '@ethersproject/providers';
/**
 * Calls a read-only method on a smart contract.
 * @param {Object} params - The parameters for the contract call.
 * @param {Contract} params.contract - The smart contract instance.
 * @param {string} params.method - The name of the method to call.
 * @param {Array<any>} params.args - The arguments to pass to the method.
 * @param {Object} [params.overrides] - Optional overrides for the transaction.
 * @returns {Promise<Result>} The result of the contract call.
 */
export declare function callReadContract({ contract, method, args, overrides, }: CallContractCommand): Promise<Result>;
/**
 * Executes a write operation on a smart contract and waits for the transaction to be mined
 * @param {Object} params - The parameters for the contract call
 * @param {Contract} params.contract - The ethers Contract instance to interact with
 * @param {string} params.method - The name of the contract method to call
 * @param {any[]} params.args - The arguments to pass to the contract method
 * @param {Overrides} [params.overrides] - Optional transaction overrides (gas price, gas limit, etc.)
 * @returns {Promise<TransactionReceipt>} The transaction receipt after the transaction is mined
 * @throws {Error} If the transaction fails or is reverted
 */
export declare function callWriteContract({ contract, method, args, overrides, }: CallContractCommand): Promise<TransactionReceipt>;
