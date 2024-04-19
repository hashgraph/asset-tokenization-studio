import { Client, ContractId } from '@hashgraph/sdk'
import { contractCall } from './contractsLifeCycle/utils'
import {
    ProxyAdmin__factory,
    BusinessLogicResolver__factory,
    IStaticFunctionSelectors__factory,
} from '../typechain-types'

export async function getProxyImplementation(
    proxyAdminAddress: ContractId,
    client: Client,
    proxyAddress: string
): Promise<string> {
    const params = [proxyAddress]
    const result = await contractCall(
        proxyAdminAddress,
        'getProxyImplementation',
        params,
        client,
        60000,
        ProxyAdmin__factory.abi
    )
    return result[0]
}

export async function getOwner(
    proxyAdminAddress: ContractId,
    client: Client
): Promise<string> {
    const params: string[] = []
    const result = await contractCall(
        proxyAdminAddress,
        'owner',
        params,
        client,
        60000,
        ProxyAdmin__factory.abi
    )
    return result[0]
}

export interface BusinessLogicRegistryData {
    businessLogicKey: string
    businessLogicAddress: string
}

export async function registerBusinessLogics(
    businessLogicRegistryData: BusinessLogicRegistryData[],
    proxyAddress: ContractId,
    client: Client
) {
    const params = [businessLogicRegistryData]

    await contractCall(
        proxyAddress,
        'registerBusinessLogics',
        params,
        client,
        7800000,
        BusinessLogicResolver__factory.abi
    )
}

export async function getBusinessLogicKeys(
    proxyAddress: ContractId,
    client: Client
) {
    const params = [0, 100]

    return await contractCall(
        proxyAddress,
        'getBusinessLogicKeys',
        params,
        client,
        7800000,
        BusinessLogicResolver__factory.abi
    )
}

export async function getStaticResolverKey(
    facetAddress: ContractId,
    client: Client
) {
    const params: string[] = []
    const result = await contractCall(
        facetAddress,
        'getStaticResolverKey',
        params,
        client,
        60000,
        IStaticFunctionSelectors__factory.abi
    )
    return result[0]
}

export function getSolidityAddress(facet: ContractId) {
    return facet.toSolidityAddress()
}
