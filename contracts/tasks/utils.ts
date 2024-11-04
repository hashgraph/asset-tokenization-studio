import { subtask, task, types } from 'hardhat/config'
import { HederaAccount } from '@hashgraph/hardhat-hethers/src/type-extensions'
import { evmToHederaFormat, getClient } from '../scripts/utils'
import { toHashgraphKey } from '../scripts/deploy'
import { getOwner, getProxyImplementation } from '../scripts/contractsMethods'
import { ContractId } from '@hashgraph/sdk'
import { GetProxyAdminConfigCommand } from './Commands'

subtask('getClient', 'Get the operator of the client')
    .addOptionalParam(
        'account',
        'The Hedera account to use for deployment. 0.0.XXXX format',
        undefined,
        types.string
    )
    .addOptionalParam(
        'privateKey',
        'The private key of the account, Raw hexadecimal string',
        undefined,
        types.string
    )
    .setAction(async (args: { account: string; privateKey: string }, hre) => {
        console.log(`Executing getOperator on ${hre.network.name} ...`)
        const accounts = hre.network.config.accounts as HederaAccount[]
        const client = getClient(hre.network.name)
        if (!client) {
            throw new Error('Client not found')
        }
        if (accounts.length === 0 || !accounts[0].account) {
            throw new Error('No accounts found')
        }
        const account: string = args.account ?? accounts[0].account
        const privateKey: string = args.privateKey ?? accounts[0].privateKey
        client.setOperator(account, toHashgraphKey(privateKey, true))
        console.log(`Operator: ${account}`)
        return { client: client, account: account, privateKey: privateKey }
    })

task('keccak256', 'Prints the keccak256 hash of a string')
    .addPositionalParam(
        'input',
        'The string to be hashed',
        undefined,
        types.string
    )
    .setAction(async ({ input }: { input: string }, hre) => {
        const hash = hre.ethers.utils.keccak256(Buffer.from(input, 'utf-8'))
        console.log(`The keccak256 hash of the input "${input}" is: ${hash}`)
    })

task('getProxyAdminConfig', 'Get Proxy Admin owner and implementation')
    .addPositionalParam(
        'proxyAdmin',
        'The proxy admin contract ID. 0.0.XXXX format',
        undefined,
        types.string
    )
    .addPositionalParam(
        'proxy',
        'The proxy contrac ID. 0.0.XXXX format',
        undefined,
        types.string
    )
    .addOptionalParam(
        'account',
        'The Hedera account to use for deployment. 0.0.XXXX format',
        undefined,
        types.string
    )
    .addOptionalParam(
        'privateKey',
        'The private key of the account, Raw hexadecimal string',
        undefined,
        types.string
    )
    .addOptionalParam(
        'clientIsEd25519',
        'Client is ED25519 key type',
        false,
        types.boolean
    )
    .setAction(async (args: GetProxyAdminConfigCommand, hre) => {
        console.log(`Executing getProxyAdminConfig on ${hre.network.name} ...`)
        const { client } = await hre.run('getClient', {
            account: args.account,
            privateKey: args.privateKey,
        })

        const owner = await evmToHederaFormat(
            await getOwner(ContractId.fromString(args.proxyAdmin), client)
        )

        const implementation = await evmToHederaFormat(
            await getProxyImplementation(
                ContractId.fromString(args.proxyAdmin),
                client,
                ContractId.fromString(args.proxy).toSolidityAddress()
            )
        )

        console.log(`Owner: ${owner}, Implementation: ${implementation}`)
    })
