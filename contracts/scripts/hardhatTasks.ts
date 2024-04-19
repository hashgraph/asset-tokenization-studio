/* eslint-disable @typescript-eslint/no-explicit-any */
import { ContractId } from '@hashgraph/sdk'
import { task } from 'hardhat/config'
import {
    deployFactory,
    deployResolver,
    deployAccessControl,
    deployControlList,
    deployPause,
    deployLock,
    deployERC20,
    deployERC1410,
    deployERC1594,
    deployERC1643,
    deployERC1644,
    deployDiamondFacet,
    deployEquity,
    deploySnapshots,
    deployScheduledSnapshots,
    deployCorporateActionsSecurity,
    deploySecurityTokenFullInfrastructure,
    toHashgraphKey,
    updateProxy,
    getProxyImpl,
    deployCap,
    deployBond,
} from './deploy'
import { evmToHederaFormat, getClient } from './utils'
import {
    getProxyImplementation,
    getOwner,
    getBusinessLogicKeys,
    registerBusinessLogics,
    BusinessLogicRegistryData,
    getStaticResolverKey,
} from './contractsMethods'

interface AccountHedera {
    account: string
    //publicKey: string
    privateKey: string
    //isED25519Type: string
}

task('getProxyAdminconfig', 'Get Proxy Admin owner and implementation')
    .addParam('proxyadmin', 'The proxy admin address')
    .addParam('proxy', 'The proxy address')
    .setAction(
        async (
            {
                proxyadmin,
                proxy,
            }: {
                proxyadmin: string
                proxy: string
            },
            hre
        ) => {
            const accounts = hre.network.config
                .accounts as unknown as Array<AccountHedera>
            const client = getClient(hre.network.name)
            const client1account: string = accounts[0].account
            const client1privatekey: string = accounts[0].privateKey
            const client1isED25519 = true

            client.setOperator(
                client1account,
                toHashgraphKey(client1privatekey, client1isED25519)
            )
            console.log(hre.network.name)
            const owner = await evmToHederaFormat(
                await getOwner(ContractId.fromString(proxyadmin), client)
            )

            const implementation = await evmToHederaFormat(
                await getProxyImplementation(
                    ContractId.fromString(proxyadmin),
                    client,
                    ContractId.fromString(proxy).toSolidityAddress()
                )
            )

            console.log(
                'Owner : ' + owner + '. Implementation : ' + implementation
            )
        }
    )

task('deployFactory', 'Deploy new factory').setAction(
    async (arguements: any, hre) => {
        const accounts = hre.network.config
            .accounts as unknown as Array<AccountHedera>
        const client = getClient(hre.network.name)

        const client1account: string = accounts[0].account
        const client1privatekey: string = accounts[0].privateKey
        const client1isED25519 = true

        console.log(hre.network.name)

        client.setOperator(
            client1account,
            toHashgraphKey(client1privatekey, client1isED25519)
        )

        const result = await deployFactory(
            client,
            client1privatekey,
            client1isED25519
        )
        const proxyAddress = result[0]
        const proxyAdminAddress = result[1]
        const factoryAddress = result[2]
        console.log(
            '\nProxy Address: \t',
            proxyAddress.toString(),
            '\nProxy Admin Address: \t',
            proxyAdminAddress.toString(),
            '\nFactory Address: \t',
            factoryAddress.toString()
        )
    }
)

task('updateFactoryVersion', 'Update factory version')
    .addParam('proxyadmin', 'The proxy admin address')
    .addParam('transparentproxy', 'The transparent proxy address')
    .addParam('implementation', 'The new implementation')
    .setAction(
        async (
            {
                proxyadmin,
                transparentproxy,
                implementation,
            }: {
                proxyadmin: string
                transparentproxy: string
                implementation: string
            },
            hre
        ) => {
            const accounts = hre.network.config
                .accounts as unknown as Array<AccountHedera>
            const client = getClient(hre.network.name)
            const client1account: string = accounts[0].account
            const client1privatekey: string = accounts[0].privateKey
            const client1isED25519 = true

            client.setOperator(
                client1account,
                toHashgraphKey(client1privatekey, client1isED25519)
            )
            console.log(hre.network.name)

            await updateProxy(
                client,
                proxyadmin,
                transparentproxy,
                implementation
            )

            await getProxyImpl(client, proxyadmin, transparentproxy)
        }
    )

task('updateBusinessLogicKeys', 'Update the address of a business logic key')
    .addParam('resolver', 'The resolver address')
    .addParam('implementations', 'The new implementation of the business logic')
    .setAction(
        async (
            {
                resolver,
                implementations,
            }: {
                resolver: string
                implementations: string
            },
            hre
        ) => {
            const accounts = hre.network.config
                .accounts as unknown as Array<AccountHedera>
            const client = getClient(hre.network.name)
            const client1account: string = accounts[0].account
            const client1privatekey: string = accounts[0].privateKey
            const client1isED25519 = true

            client.setOperator(
                client1account,
                toHashgraphKey(client1privatekey, client1isED25519)
            )
            console.log(hre.network.name)

            const businessLogicRegistries: BusinessLogicRegistryData[] = []

            const implementationList = implementations.split(',')

            for (let i = 0; i < implementationList.length; i++) {
                const facet = ContractId.fromString(implementationList[i])

                console.log(implementationList[i])

                const businessLogicKey = await getStaticResolverKey(
                    facet,
                    client
                )

                console.log(businessLogicKey)

                businessLogicRegistries.push({
                    businessLogicKey: businessLogicKey,
                    businessLogicAddress: ContractId.fromString(
                        implementationList[i]
                    ).toSolidityAddress(),
                })
            }

            const resolverContract = ContractId.fromString(resolver)

            await registerBusinessLogics(
                businessLogicRegistries,
                resolverContract,
                client
            )
        }
    )

task(
    'deployAll',
    'Deploy new factory, new facet implementation, new resolver and initialize it with the new facet implementations'
).setAction(async (arguements: any, hre) => {
    const accounts = hre.network.config
        .accounts as unknown as Array<AccountHedera>
    const client = getClient(hre.network.name)

    const client1account: string = accounts[0].account
    const client1privatekey: string = accounts[0].privateKey
    const client1isED25519 = true

    console.log(hre.network.name)

    client.setOperator(
        client1account,
        toHashgraphKey(client1privatekey, client1isED25519)
    )

    const result = await deploySecurityTokenFullInfrastructure(
        client,
        client1privatekey,
        client1isED25519
    )
    let i = 0
    const resolverProxyAddress = result[i++]
    const resolverProxyAdminAddress = result[i++]
    const resolverAddress = result[i++]
    const accessControl = result[i++]
    const cap = result[i++]
    const controlList = result[i++]
    const pause = result[i++]
    const erc20 = result[i++]
    const erc1410 = result[i++]
    const erc1594 = result[i++]
    const erc1643 = result[i++]
    const erc1644 = result[i++]
    const snapshots = result[i++]
    const diamondFacet = result[i++]
    const equity = result[i++]
    const bond = result[i++]
    const scheduledSnapshot = result[i++]
    const corporateActions = result[i++]
    const lock = result[i++]
    const transferAndLock = result[i++]
    const factoryProxyAddress = result[i++]
    const factoryProxyAdminAddress = result[i++]
    const factoryAddress = result[i++]

    console.log(
        '\nResolver Proxy Address: \t',
        resolverProxyAddress.toString(),
        '\nResolver Proxy Admin Address: \t',
        resolverProxyAdminAddress.toString(),
        '\nResolver Address: \t',
        resolverAddress.toString(),
        '\nFactory Proxy Address: \t',
        factoryProxyAddress.toString(),
        '\nFactory Proxy Admin Address: \t',
        factoryProxyAdminAddress.toString(),
        '\nFactory Address: \t',
        factoryAddress.toString(),
        '\nAccess Control Address: \t',
        accessControl.toString(),
        '\nCap Address: \t',
        cap.toString(),
        '\nControl List Address: \t',
        controlList.toString(),
        '\nPause Address: \t',
        pause.toString(),
        '\nERC20 Address: \t',
        erc20.toString(),
        '\nERC1410 Address: \t',
        erc1410.toString(),
        '\nERC1594Address: \t',
        erc1594.toString(),
        '\nERC1643 Address: \t',
        erc1643.toString(),
        '\nERC1644 Address: \t',
        erc1644.toString(),
        '\nSnapshots Address: \t',
        snapshots.toString(),
        '\nDiamond Facet Address: \t',
        diamondFacet.toString(),
        '\nEquity Address: \t',
        equity.toString(),
        '\nBond Address: \t',
        bond.toString(),
        '\nScheduled Snapshots Address: \t',
        scheduledSnapshot.toString(),
        '\nCorporate Actions Address: \t',
        corporateActions.toString(),
        '\nLock Address: \t',
        lock.toString(),
        '\nTransfer and Lock Address: \t',
        transferAndLock.toString()
    )
})

task('getResolverBusinessLogics', 'Get business logics from resolver')
    .addParam('resolver', 'The resolver proxy admin address')
    .setAction(
        async (
            {
                resolver,
            }: {
                resolver: string
            },
            hre
        ) => {
            const accounts = hre.network.config
                .accounts as unknown as Array<AccountHedera>
            const client = getClient(hre.network.name)
            const client1account: string = accounts[0].account
            const client1privatekey: string = accounts[0].privateKey
            const client1isED25519 = true

            client.setOperator(
                client1account,
                toHashgraphKey(client1privatekey, client1isED25519)
            )
            console.log(hre.network.name)

            const result = await getBusinessLogicKeys(
                ContractId.fromString(resolver),
                client
            )

            console.log(result)
        }
    )

task('deployResolver', 'Deploy new resolver').setAction(
    async (arguements: any, hre) => {
        const accounts = hre.network.config
            .accounts as unknown as Array<AccountHedera>
        const client = getClient(hre.network.name)

        const client1account: string = accounts[0].account
        const client1privatekey: string = accounts[0].privateKey
        const client1isED25519 = true

        console.log(hre.network.name)

        client.setOperator(
            client1account,
            toHashgraphKey(client1privatekey, client1isED25519)
        )

        const result = await deployResolver(
            client,
            client1privatekey,
            client1isED25519
        )
        const proxyAddress = result[0]
        const proxyAdminAddress = result[1]
        const resolverAddress = result[2]
        console.log(
            '\nProxy Address: \t',
            proxyAddress.toString(),
            '\nProxy Admin Address: \t',
            proxyAdminAddress.toString(),
            '\nResolver Address: \t',
            resolverAddress.toString()
        )
    }
)

task('deployAccessControl', 'Deploy new access control').setAction(
    async (arguements: any, hre) => {
        const accounts = hre.network.config
            .accounts as unknown as Array<AccountHedera>
        const client = getClient(hre.network.name)

        const client1account: string = accounts[0].account
        const client1privatekey: string = accounts[0].privateKey
        const client1isED25519 = true

        console.log(hre.network.name)

        client.setOperator(
            client1account,
            toHashgraphKey(client1privatekey, client1isED25519)
        )

        const result = await deployAccessControl(client, client1privatekey)
        const accessControlAddress = result

        console.log(
            '\nAccess Control Address: \t',
            accessControlAddress.toString()
        )
    }
)

task('deployCap', 'Deploy new cap').setAction(async (arguements: any, hre) => {
    const accounts = hre.network.config
        .accounts as unknown as Array<AccountHedera>
    const client = getClient(hre.network.name)

    const client1account: string = accounts[0].account
    const client1privatekey: string = accounts[0].privateKey
    const client1isED25519 = true

    console.log(hre.network.name)

    client.setOperator(
        client1account,
        toHashgraphKey(client1privatekey, client1isED25519)
    )

    const result = await deployCap(client, client1privatekey)
    const capAddress = result

    console.log('\nCap Address: \t', capAddress.toString())
})

task('deployControlList', 'Deploy new control list').setAction(
    async (arguements: any, hre) => {
        const accounts = hre.network.config
            .accounts as unknown as Array<AccountHedera>
        const client = getClient(hre.network.name)

        const client1account: string = accounts[0].account
        const client1privatekey: string = accounts[0].privateKey
        const client1isED25519 = true

        console.log(hre.network.name)

        client.setOperator(
            client1account,
            toHashgraphKey(client1privatekey, client1isED25519)
        )

        const result = await deployControlList(client, client1privatekey)
        const controlListAddress = result

        console.log('\nControl List Address: \t', controlListAddress.toString())
    }
)

task('deployPause', 'Deploy new pause').setAction(
    async (arguements: any, hre) => {
        const accounts = hre.network.config
            .accounts as unknown as Array<AccountHedera>
        const client = getClient(hre.network.name)

        const client1account: string = accounts[0].account
        const client1privatekey: string = accounts[0].privateKey
        const client1isED25519 = true

        console.log(hre.network.name)

        client.setOperator(
            client1account,
            toHashgraphKey(client1privatekey, client1isED25519)
        )

        const result = await deployPause(client, client1privatekey)
        const pauseAddress = result

        console.log('\nPause Address: \t', pauseAddress.toString())
    }
)

task('deployLock', 'Deploy new lock').setAction(
    async (arguements: any, hre) => {
        const accounts = hre.network.config
            .accounts as unknown as Array<AccountHedera>
        const client = getClient(hre.network.name)

        const client1account: string = accounts[0].account
        const client1privatekey: string = accounts[0].privateKey
        const client1isED25519 = true

        console.log(hre.network.name)

        client.setOperator(
            client1account,
            toHashgraphKey(client1privatekey, client1isED25519)
        )

        const result = await deployLock(client, client1privatekey)
        const lockAddress = result

        console.log('\nLock Address: \t', lockAddress.toString())
    }
)

task('deploySnapshot', 'Deploy new snapshot').setAction(
    async (arguements: any, hre) => {
        const accounts = hre.network.config
            .accounts as unknown as Array<AccountHedera>
        const client = getClient(hre.network.name)

        const client1account: string = accounts[0].account
        const client1privatekey: string = accounts[0].privateKey
        const client1isED25519 = true

        console.log(hre.network.name)

        client.setOperator(
            client1account,
            toHashgraphKey(client1privatekey, client1isED25519)
        )

        const result = await deploySnapshots(client, client1privatekey)
        const snapshotAddress = result

        console.log('\nSnapshot Address: \t', snapshotAddress.toString())
    }
)

task('deployScheduledSnapshot', 'Deploy new scheduled snapshot').setAction(
    async (arguements: any, hre) => {
        const accounts = hre.network.config
            .accounts as unknown as Array<AccountHedera>
        const client = getClient(hre.network.name)

        const client1account: string = accounts[0].account
        const client1privatekey: string = accounts[0].privateKey
        const client1isED25519 = true

        console.log(hre.network.name)

        client.setOperator(
            client1account,
            toHashgraphKey(client1privatekey, client1isED25519)
        )

        const result = await deployScheduledSnapshots(client, client1privatekey)
        const scheduledSnapshotAddress = result

        console.log(
            '\nScheduled Snapshot Address: \t',
            scheduledSnapshotAddress.toString()
        )
    }
)

task('deployCorporateActions', 'Deploy new corporate actions').setAction(
    async (arguements: any, hre) => {
        const accounts = hre.network.config
            .accounts as unknown as Array<AccountHedera>
        const client = getClient(hre.network.name)

        const client1account: string = accounts[0].account
        const client1privatekey: string = accounts[0].privateKey
        const client1isED25519 = true

        console.log(hre.network.name)

        client.setOperator(
            client1account,
            toHashgraphKey(client1privatekey, client1isED25519)
        )

        const result = await deployCorporateActionsSecurity(
            client,
            client1privatekey
        )
        const corporateActionsAddress = result

        console.log(
            '\nCorporate Actions Address: \t',
            corporateActionsAddress.toString()
        )
    }
)

task('deployERC20', 'Deploy new erc20').setAction(
    async (arguements: any, hre) => {
        const accounts = hre.network.config
            .accounts as unknown as Array<AccountHedera>
        const client = getClient(hre.network.name)

        const client1account: string = accounts[0].account
        const client1privatekey: string = accounts[0].privateKey
        const client1isED25519 = true

        console.log(hre.network.name)

        client.setOperator(
            client1account,
            toHashgraphKey(client1privatekey, client1isED25519)
        )

        const result = await deployERC20(client, client1privatekey)
        const erc20Address = result

        console.log('\nERC20 Address: \t', erc20Address.toString())
    }
)

task('deployERC1410', 'Deploy new erc1410').setAction(
    async (arguements: any, hre) => {
        const accounts = hre.network.config
            .accounts as unknown as Array<AccountHedera>
        const client = getClient(hre.network.name)

        const client1account: string = accounts[0].account
        const client1privatekey: string = accounts[0].privateKey
        const client1isED25519 = true

        console.log(hre.network.name)

        client.setOperator(
            client1account,
            toHashgraphKey(client1privatekey, client1isED25519)
        )

        const result = await deployERC1410(client, client1privatekey)
        const erc1410Address = result

        console.log('\nERC1410 Address: \t', erc1410Address.toString())
    }
)

task('deployERC1594', 'Deploy new erc1594').setAction(
    async (arguements: any, hre) => {
        const accounts = hre.network.config
            .accounts as unknown as Array<AccountHedera>
        const client = getClient(hre.network.name)

        const client1account: string = accounts[0].account
        const client1privatekey: string = accounts[0].privateKey
        const client1isED25519 = true

        console.log(hre.network.name)

        client.setOperator(
            client1account,
            toHashgraphKey(client1privatekey, client1isED25519)
        )

        const result = await deployERC1594(client, client1privatekey)
        const erc1594Address = result

        console.log('\nERC1594 Address: \t', erc1594Address.toString())
    }
)

task('deployERC1643', 'Deploy new erc1643').setAction(
    async (arguements: any, hre) => {
        const accounts = hre.network.config
            .accounts as unknown as Array<AccountHedera>
        const client = getClient(hre.network.name)

        const client1account: string = accounts[0].account
        const client1privatekey: string = accounts[0].privateKey
        const client1isED25519 = true

        console.log(hre.network.name)

        client.setOperator(
            client1account,
            toHashgraphKey(client1privatekey, client1isED25519)
        )

        const result = await deployERC1643(client, client1privatekey)
        const erc1643Address = result

        console.log('\nERC1643 Address: \t', erc1643Address.toString())
    }
)

task('deployERC1644', 'Deploy new erc1644').setAction(
    async (arguements: any, hre) => {
        const accounts = hre.network.config
            .accounts as unknown as Array<AccountHedera>
        const client = getClient(hre.network.name)

        const client1account: string = accounts[0].account
        const client1privatekey: string = accounts[0].privateKey
        const client1isED25519 = true

        console.log(hre.network.name)

        client.setOperator(
            client1account,
            toHashgraphKey(client1privatekey, client1isED25519)
        )

        const result = await deployERC1644(client, client1privatekey)
        const erc1644Address = result

        console.log('\nERC1644 Address: \t', erc1644Address.toString())
    }
)

task('deployDiamondFacet', 'Deploy new diamond facet').setAction(
    async (arguements: any, hre) => {
        const accounts = hre.network.config
            .accounts as unknown as Array<AccountHedera>
        const client = getClient(hre.network.name)

        const client1account: string = accounts[0].account
        const client1privatekey: string = accounts[0].privateKey
        const client1isED25519 = true

        console.log(hre.network.name)

        client.setOperator(
            client1account,
            toHashgraphKey(client1privatekey, client1isED25519)
        )

        const result = await deployDiamondFacet(client, client1privatekey)
        const diamondAddress = result

        console.log('\nDiamond Facet Address: \t', diamondAddress.toString())
    }
)

task('deployEquity', 'Deploy new equity').setAction(
    async (arguements: any, hre) => {
        const accounts = hre.network.config
            .accounts as unknown as Array<AccountHedera>
        const client = getClient(hre.network.name)

        const client1account: string = accounts[0].account
        const client1privatekey: string = accounts[0].privateKey
        const client1isED25519 = true

        console.log(hre.network.name)

        client.setOperator(
            client1account,
            toHashgraphKey(client1privatekey, client1isED25519)
        )

        const result = await deployEquity(client, client1privatekey)
        const equityAddress = result

        console.log('\nEquity Address: \t', equityAddress.toString())
    }
)

task('deployBond', 'Deploy new bond').setAction(
    async (arguements: any, hre) => {
        const accounts = hre.network.config
            .accounts as unknown as Array<AccountHedera>
        const client = getClient(hre.network.name)

        const client1account: string = accounts[0].account
        const client1privatekey: string = accounts[0].privateKey
        const client1isED25519 = true

        console.log(hre.network.name)

        client.setOperator(
            client1account,
            toHashgraphKey(client1privatekey, client1isED25519)
        )

        const result = await deployBond(client, client1privatekey)
        const bondAddress = result

        console.log('Bond Address: \t', bondAddress.toString())
    }
)
