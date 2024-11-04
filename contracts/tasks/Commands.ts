import { Client } from '@hashgraph/sdk'

export interface GetClientResult {
    client: Client
    account: string
    privateKey: string
}

interface BasicCommand {
    account?: string
    privateKey?: string
    clientIsEd25519: boolean
}

export interface GetClientCommand {
    account: string
    privateKey: string
}
export interface DeployAllCommand extends BasicCommand {
    useDeployed: boolean
}

export interface GetProxyAdminConfigCommand extends BasicCommand {
    proxyAdmin: string
    proxy: string
}
