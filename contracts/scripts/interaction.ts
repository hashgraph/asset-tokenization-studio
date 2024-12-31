import { Result } from 'ethers/lib/utils'
import { CallContractCommand } from '.'
import {
    TransactionReceipt,
    TransactionResponse,
} from '@ethersproject/providers'

// * External functions

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
function callContract({
    contract,
    method,
    args,
    overrides,
}: CallContractCommand): Promise<TransactionResponse | Result> {
    return contract[method](...args, { ...overrides })
}
