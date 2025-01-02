import { Result } from 'ethers/lib/utils'
import { CallContractCommand } from '.'
import {
    TransactionReceipt,
    TransactionResponse,
} from '@ethersproject/providers'

// * External functions
/**
 * Calls a read-only method on a smart contract.
 * @param {Object} params - The parameters for the contract call.
 * @param {Contract} params.contract - The smart contract instance.
 * @param {string} params.method - The name of the method to call.
 * @param {Array<any>} params.args - The arguments to pass to the method.
 * @param {Object} [params.overrides] - Optional overrides for the transaction.
 * @returns {Promise<Result>} The result of the contract call.
 */
export async function callReadContract({
    contract,
    method,
    args,
    overrides,
}: CallContractCommand): Promise<Result> {
    const result: Result = await contract.callStatic[method](...args, {
        ...overrides,
    })
    return result
}

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
export async function callWriteContract({
    contract,
    method,
    args,
    overrides,
}: CallContractCommand): Promise<TransactionReceipt> {
    const command = new CallContractCommand({
        contract,
        method,
        args,
        overrides,
    })
    const response: TransactionResponse = (await callContract(
        command
    )) as TransactionResponse
    return await response.wait()
}

// * Internal functions
/**
 * Calls a smart contract method with provided arguments and overrides.
 * @param {Object} params - The parameters object
 * @param {Contract} params.contract - The ethers.js Contract instance to call
 * @param {string} params.method - The name of the contract method to call
 * @param {any[]} params.args - Array of arguments to pass to the contract method
 * @param {Overrides} params.overrides - Transaction overrides (e.g., gasLimit, value)
 * @returns {Promise<TransactionResponse | Result>} A promise that resolves to either a TransactionResponse (for write operations) or Result (for read operations)
 */
function callContract({
    contract,
    method,
    args,
    overrides,
}: CallContractCommand): Promise<TransactionResponse | Result> {
    return contract[method](...args, { ...overrides })
}
