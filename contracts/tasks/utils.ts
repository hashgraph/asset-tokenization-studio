import { subtask, task, types } from 'hardhat/config'
import { HederaAccount } from '@hashgraph/hardhat-hethers/src/type-extensions'
import { evmToHederaFormat, getClient, toHashgraphKey } from '../scripts/utils'
import {
    getBusinessLogicKeys,
    getFacetsByConfigurationIdAndVersion,
    getFacetsLengthByConfigurationIdAndVersion,
    getLatestVersionByConfiguration,
    getOwner,
    getProxyImplementation,
} from '../scripts/contractsMethods'
import { ContractId } from '@hashgraph/sdk'
import {
    GetClientArgs,
    GetClientResult,
    GetConfigurationInfoArgs,
    GetProxyAdminConfigArgs,
    GetResolverBusinessLogicsArgs,
} from './Arguments'

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
    .addOptionalParam(
        'isEd25519',
        'Client is ED25519 key type',
        false,
        types.boolean
    )
    .setAction(async (args: GetClientArgs, hre) => {
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
        client.setOperator(
            account,
            toHashgraphKey({ privateKey, isED25519: args.isEd25519 })
        )
        console.log(`Operator: ${account}`)
        return {
            client: client,
            account: account,
            privateKey: privateKey,
        } as GetClientResult
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
        'isEd25519',
        'Client is ED25519 key type',
        false,
        types.boolean
    )
    .setAction(async (args: GetProxyAdminConfigArgs, hre) => {
        console.log(`Executing getProxyAdminConfig on ${hre.network.name} ...`)
        const { client } = await hre.run('getClient', {
            account: args.account,
            privateKey: args.privateKey,
            isEd25519: args.isEd25519,
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

task('getConfigurationInfo', 'Get all info for a given configuration')
    .addPositionalParam(
        'resolver',
        'The resolver proxy admin address',
        undefined,
        types.string
    )
    .addPositionalParam('configId', 'The config ID', undefined, types.string)
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
        'isEd25519',
        'Client is ED25519 key type',
        false,
        types.boolean
    )
    .setAction(async (args: GetConfigurationInfoArgs, hre) => {
        console.log(`Executing getConfigurationInfo on ${hre.network.name} ...`)

        const { client } = await hre.run('getClient', {
            account: args.account,
            privateKey: args.privateKey,
            isEd25519: args.isEd25519,
        })

        const configVersionLatest = parseInt(
            await getLatestVersionByConfiguration(
                args.configId,
                ContractId.fromString(args.resolver),
                client
            ),
            16
        )

        console.log(
            `Number of Versions for Config ${args.configId}: ${configVersionLatest}`
        )

        for (
            let currentVersion = 1;
            currentVersion <= configVersionLatest;
            currentVersion++
        ) {
            const facetLength = parseInt(
                await getFacetsLengthByConfigurationIdAndVersion(
                    args.configId,
                    currentVersion,
                    ContractId.fromString(args.resolver),
                    client
                ),
                16
            )

            console.log(
                `Number of Facets for Config ${args.configId} and Version ${currentVersion}: ${facetLength}`
            )

            const facets = await getFacetsByConfigurationIdAndVersion(
                args.configId,
                currentVersion,
                0,
                facetLength,
                ContractId.fromString(args.resolver),
                client
            )

            for (const [index, facet] of facets[0].entries()) {
                console.log(`Facet ${index + 1}:`)
                console.log(`  ID: ${facet.id}`)
                console.log(`  Address: ${facet.addr}`)
                console.log(
                    `  Selectors: ${JSON.stringify(facet.selectors, null, 2)}`
                )
                console.log(
                    `  Interface IDs: ${JSON.stringify(
                        facet.interfaceIds,
                        null,
                        2
                    )}`
                )
                console.log('-------------------------')
            }
        }
    })

task('getResolverBusinessLogics', 'Get business logics from resolver')
    .addPositionalParam(
        'resolver',
        'The resolver proxy admin address',
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
        'isEd25519',
        'Client is ED25519 key type',
        false,
        types.boolean
    )
    .setAction(async (args: GetResolverBusinessLogicsArgs, hre) => {
        console.log(
            `Executing getResolverBusinessLogics on ${hre.network.name} ...`
        )

        // Get the client
        const { client } = await hre.run('getClient', {
            account: args.account,
            privateKey: args.privateKey,
            isEd25519: args.isEd25519,
        })

        // Fetch business logic keys
        const result = await getBusinessLogicKeys(
            ContractId.fromString(args.resolver),
            client
        )

        // Log the business logic keys
        console.log('Business Logic Keys:')
        result.forEach((key: any, index: number) => {
            console.log(`  Key ${index + 1}: ${key}`)
        })
    })
