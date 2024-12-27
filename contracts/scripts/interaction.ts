import { CallContractCommand } from '@scripts'
import { Result } from 'ethers/lib/utils'

// * External functions
export async function callReadContract({
    contract,
    method,
    args,
    overrides,
}: CallContractCommand): Promise {
    const result = await contract.callStatic[method](...args, { ...overrides })
}
// * Internal functions
function callContract({
    contract,
    method,
    args,
    overrides,
}: CallContractCommand): Promise {
    return contract[method](...args, { ...overrides })
}
