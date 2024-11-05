import { Client } from '@hashgraph/sdk'

export interface GetClientResult {
    client: Client
    account: string
    privateKey: string
}

interface BasicArgs {
    account?: string
    privateKey?: string
    isEd25519: boolean
}

export interface GetClientArgs extends BasicArgs {}

export interface DeployAllArgs extends BasicArgs {
    useDeployed: boolean
}

export interface GetProxyAdminConfigArgs extends BasicArgs {
    proxyAdmin: string
    proxy: string
}

export interface GetConfigurationInfoArgs extends BasicArgs {
    resolver: string
    configId: string
}

export interface GetResolverBusinessLogicsArgs extends BasicArgs {
    resolver: string
}
