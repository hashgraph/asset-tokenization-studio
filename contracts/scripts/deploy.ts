/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Client,
    ContractFunctionParameters,
    ContractId,
    PrivateKey,
} from '@hashgraph/sdk'
import {
    AccessControl__factory,
    BondUSA__factory,
    BusinessLogicResolver__factory,
    Cap__factory,
    ControlList__factory,
    CorporateActionsSecurity__factory,
    DiamondFacet__factory,
    EquityUSA__factory,
    ERC1410ScheduledSnapshot__factory,
    ERC1594__factory,
    ERC1643__factory,
    ERC1644__factory,
    ERC20__factory,
    Factory__factory,
    Lock__factory,
    Pause__factory,
    ProxyAdmin__factory,
    ScheduledSnapshots__factory,
    Snapshots__factory,
    TransferAndLock__factory,
    TransparentUpgradeableProxy__factory,
} from '../typechain-types'
import {
    deployContractSDK,
    getClient,
    getContractInfo,
    toEvmAddress,
} from './utils'
import { contractCall } from './contractsLifeCycle/utils'
import {
    BusinessLogicRegistryData,
    getSolidityAddress,
    getStaticResolverKey,
    registerBusinessLogics,
} from './contractsMethods'

export function initializeClient(): [
    Client,
    string,
    string,
    //string,
    boolean
] {
    const hre = require('hardhat')
    const hreConfig = hre.network.config
    const client = getClient()
    const clientaccount: string = hreConfig.accounts[0].account
    const clientprivatekey: string = hreConfig.accounts[0].privateKey
    //const clientpublickey: string = hreConfig.accounts[0].publicKey
    const clientsED25519 = true
    client.setOperator(
        clientaccount,
        toHashgraphKey(clientprivatekey, clientsED25519)
    )

    return [
        client,
        clientaccount,
        clientprivatekey,
        //clientpublickey,
        clientsED25519,
    ]
}

export function toHashgraphKey(privateKey: string, isED25519: boolean) {
    return isED25519
        ? PrivateKey.fromStringED25519(privateKey)
        : PrivateKey.fromStringECDSA(privateKey)
}

export async function updateProxy(
    clientOperator: Client,
    proxy: string,
    transparentproxy: string,
    newImplementation: string
) {
    // Deploying Factory logic
    console.log(`Upgrading proxy logic. please wait...`)
    console.log('Admin proxy :' + proxy)
    console.log('Transparent proxy :' + transparentproxy)
    console.log('New Implementation :' + newImplementation)
    console.log(ContractId.fromString(newImplementation).toSolidityAddress())
    await contractCall(
        ContractId.fromString(proxy),
        'upgrade',
        [
            ContractId.fromString(transparentproxy).toSolidityAddress(),
            ContractId.fromString(newImplementation).toSolidityAddress(),
        ],
        clientOperator,
        150000,
        ProxyAdmin__factory.abi
    )
}
export async function getProxyImpl(
    clientOperator: Client,
    proxyadmin: string,
    transparent: string
) {
    // Deploying Factory logic
    console.log(`Getting implementation from proxy please wait...`)
    console.log('ProxyAdmin :' + proxyadmin)
    const address = await contractCall(
        ContractId.fromString(proxyadmin),
        'getProxyImplementation',
        [ContractId.fromString(transparent).toSolidityAddress()],
        clientOperator,
        150000,
        ProxyAdmin__factory.abi
    )
    console.log('New Implementation' + address[0])
}

export async function deploySecurityTokenFullInfrastructure(
    clientOperator: Client,
    privateKey: string,
    isED25519Type: boolean
) {
    const resolverResult = await deployResolver(
        clientOperator,
        privateKey,
        isED25519Type
    )
    const resolver = resolverResult[0]
    const accessControl = await deployAccessControl(clientOperator, privateKey)
    const cap = await deployCap(clientOperator, privateKey)
    const controlList = await deployControlList(clientOperator, privateKey)
    const pause = await deployPause(clientOperator, privateKey)
    const lock = await deployLock(clientOperator, privateKey)
    const erc20 = await deployERC20(clientOperator, privateKey)
    const erc1410 = await deployERC1410(clientOperator, privateKey)
    const erc1594 = await deployERC1594(clientOperator, privateKey)
    const erc1643 = await deployERC1643(clientOperator, privateKey)
    const erc1644 = await deployERC1644(clientOperator, privateKey)
    const snapshots = await deploySnapshots(clientOperator, privateKey)
    const diamondFacet = await deployDiamondFacet(clientOperator, privateKey)
    const equity = await deployEquity(clientOperator, privateKey)
    const bond = await deployBond(clientOperator, privateKey)
    const scheduledSnapshots = await deployScheduledSnapshots(
        clientOperator,
        privateKey
    )
    const corporateActionsSecurity = await deployCorporateActionsSecurity(
        clientOperator,
        privateKey
    )
    const transferAndLock = await deployTransferAndLock(
        clientOperator,
        privateKey
    )

    const businessLogicRegistries: BusinessLogicRegistryData[] = [
        {
            businessLogicKey: await getStaticResolverKey(
                diamondFacet,
                clientOperator
            ),
            businessLogicAddress: getSolidityAddress(diamondFacet),
        },
        {
            businessLogicKey: await getStaticResolverKey(
                accessControl,
                clientOperator
            ),
            businessLogicAddress: getSolidityAddress(accessControl),
        },
        {
            businessLogicKey: await getStaticResolverKey(cap, clientOperator),
            businessLogicAddress: getSolidityAddress(cap),
        },
        {
            businessLogicKey: await getStaticResolverKey(pause, clientOperator),
            businessLogicAddress: getSolidityAddress(pause),
        },
        {
            businessLogicKey: await getStaticResolverKey(
                controlList,
                clientOperator
            ),
            businessLogicAddress: getSolidityAddress(controlList),
        },
        {
            businessLogicKey: await getStaticResolverKey(erc20, clientOperator),
            businessLogicAddress: getSolidityAddress(erc20),
        },
        {
            businessLogicKey: await getStaticResolverKey(
                erc1644,
                clientOperator
            ),
            businessLogicAddress: getSolidityAddress(erc1644),
        },
        {
            businessLogicKey: await getStaticResolverKey(
                erc1410,
                clientOperator
            ),
            businessLogicAddress: getSolidityAddress(erc1410),
        },
        {
            businessLogicKey: await getStaticResolverKey(
                erc1594,
                clientOperator
            ),
            businessLogicAddress: getSolidityAddress(erc1594),
        },
        {
            businessLogicKey: await getStaticResolverKey(
                erc1643,
                clientOperator
            ),
            businessLogicAddress: getSolidityAddress(erc1643),
        },
        {
            businessLogicKey: await getStaticResolverKey(
                snapshots,
                clientOperator
            ),
            businessLogicAddress: getSolidityAddress(snapshots),
        },
        {
            businessLogicKey: await getStaticResolverKey(
                equity,
                clientOperator
            ),
            businessLogicAddress: getSolidityAddress(equity),
        },
        {
            businessLogicKey: await getStaticResolverKey(bond, clientOperator),
            businessLogicAddress: getSolidityAddress(bond),
        },
        {
            businessLogicKey: await getStaticResolverKey(
                scheduledSnapshots,
                clientOperator
            ),
            businessLogicAddress: getSolidityAddress(scheduledSnapshots),
        },
        {
            businessLogicKey: await getStaticResolverKey(
                corporateActionsSecurity,
                clientOperator
            ),
            businessLogicAddress: getSolidityAddress(corporateActionsSecurity),
        },
        {
            businessLogicKey: await getStaticResolverKey(lock, clientOperator),
            businessLogicAddress: getSolidityAddress(lock),
        },
        {
            businessLogicKey: await getStaticResolverKey(
                transferAndLock,
                clientOperator
            ),
            businessLogicAddress: getSolidityAddress(transferAndLock),
        },
    ]

    await registerBusinessLogics(
        businessLogicRegistries,
        resolver,
        clientOperator
    )

    const factoryResult = await deployFactory(
        clientOperator,
        privateKey,
        isED25519Type
    )

    return [
        resolverResult[0],
        resolverResult[1],
        resolverResult[2],
        accessControl,
        cap,
        controlList,
        pause,
        erc20,
        erc1410,
        erc1594,
        erc1643,
        erc1644,
        snapshots,
        diamondFacet,
        equity,
        bond,
        scheduledSnapshots,
        corporateActionsSecurity,
        lock,
        transferAndLock,
        factoryResult[0],
        factoryResult[1],
        factoryResult[2],
    ]
}

async function deployProxyAdmin(
    clientOperator: Client,
    privateKey: string,
    isED25519Type: boolean
) {
    const AccountEvmAddress = await toEvmAddress(
        clientOperator.operatorAccountId!.toString(),
        isED25519Type
    )

    const paramsProxyAdmin = new ContractFunctionParameters().addAddress(
        AccountEvmAddress
    )

    return await deployContractSDK(
        ProxyAdmin__factory,
        privateKey,
        clientOperator,
        paramsProxyAdmin
    )
}

async function deployTransparentProxy(
    clientOperator: Client,
    privateKey: string,
    proxyAdmin: ContractId,
    implementation: ContractId
) {
    const params = new ContractFunctionParameters()
        .addAddress(
            (await getContractInfo(implementation.toString())).evm_address
        )
        .addAddress((await getContractInfo(proxyAdmin.toString())).evm_address)
        .addBytes(new Uint8Array([]))

    return await deployContractSDK(
        TransparentUpgradeableProxy__factory,
        privateKey,
        clientOperator,
        params,
        undefined,
        '0x' + proxyAdmin.toSolidityAddress()
    )
}

export async function deployFactory(
    clientOperator: Client,
    privateKey: string,
    isED25519Type: boolean
) {
    // Deploying Factory logic
    console.log(`Deploying Contract Factory. please wait...`)

    const factory = await deployContractSDK(
        Factory__factory,
        privateKey,
        clientOperator
    )

    console.log(
        `Contract Factory deployed ${
            (await getContractInfo(factory.toString())).evm_address
        }`
    )

    // Deploying Factory Proxy Admin
    console.log(`Deploying Contract Factory Proxy Admin. please wait...`)

    const factoryProxyAdmin = await deployProxyAdmin(
        clientOperator,
        privateKey,
        isED25519Type
    )

    console.log(
        `Contract Factory Proxy Admin deployed ${
            (await getContractInfo(factoryProxyAdmin.toString())).evm_address
        }`
    )

    // Deploying Factory Proxy
    console.log(`Deploying Contract Factory Proxy. please wait...`)

    const factoryProxy = await deployTransparentProxy(
        clientOperator,
        privateKey,
        factoryProxyAdmin,
        factory
    )

    console.log(
        `Contract Factory Proxy deployed ${
            (await getContractInfo(factoryProxyAdmin.toString())).evm_address
        }`
    )

    return [factoryProxy, factoryProxyAdmin, factory]
}

export async function deployResolver(
    clientOperator: Client,
    privateKey: string,
    isED25519Type: boolean
) {
    // Deploying Resolver logic
    console.log(`Deploying Business Resolver. please wait...`)

    const resolver = await deployContractSDK(
        BusinessLogicResolver__factory,
        privateKey,
        clientOperator
    )

    console.log(
        `Resolver deployed ${
            (await getContractInfo(resolver.toString())).evm_address
        }`
    )

    // Deploying Resolver Proxy Admin
    console.log(`Deploying Resolver Proxy Admin. please wait...`)

    const resolverProxyAdmin = await deployProxyAdmin(
        clientOperator,
        privateKey,
        isED25519Type
    )

    console.log(
        `Resolver Proxy Admin deployed ${
            (await getContractInfo(resolverProxyAdmin.toString())).evm_address
        }`
    )

    // Deploying Resolver Proxy
    console.log(`Deploying Resolver Proxy. please wait...`)

    const resolverProxy = await deployTransparentProxy(
        clientOperator,
        privateKey,
        resolverProxyAdmin,
        resolver
    )

    const resolverProxyInfo = await getContractInfo(resolverProxy.toString())

    console.log(`Resolver Proxy deployed ${resolverProxyInfo.evm_address}`)

    await contractCall(
        resolverProxy,
        'initialize_BusinessLogicResolver',
        [],
        clientOperator,
        8000000,
        BusinessLogicResolver__factory.abi
    )

    console.log('resolver initialized')

    const admin = await contractCall(
        resolverProxy,
        'getRoleMembers',
        [
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '0',
            '1',
        ],
        clientOperator,
        130000,
        BusinessLogicResolver__factory.abi
    )

    console.log(`Resolver Initialized ${admin[0]}`)

    return [resolverProxy, resolverProxyAdmin, resolver]
}

export async function deployAccessControl(
    clientOperator: Client,
    privateKey: string
) {
    // Deploying Access Control logic
    console.log(`Deploying Access Control. please wait...`)

    const accessControl = await deployContractSDK(
        AccessControl__factory,
        privateKey,
        clientOperator
    )

    console.log(
        `Access Control deployed ${
            (await getContractInfo(accessControl.toString())).evm_address
        }`
    )

    return accessControl
}

export async function deployCap(clientOperator: Client, privateKey: string) {
    // Deploying Cap logic
    console.log(`Deploying Cap. please wait...`)

    const cap = await deployContractSDK(
        Cap__factory,
        privateKey,
        clientOperator
    )

    console.log(
        `Cap deployed ${(await getContractInfo(cap.toString())).evm_address}`
    )

    return cap
}

export async function deployControlList(
    clientOperator: Client,
    privateKey: string
) {
    // Deploying Contrl List logic
    console.log(`Deploying Control List. please wait...`)

    const controlList = await deployContractSDK(
        ControlList__factory,
        privateKey,
        clientOperator
    )

    console.log(
        `Control List deployed ${
            (await getContractInfo(controlList.toString())).evm_address
        }`
    )

    return controlList
}

export async function deployPause(clientOperator: Client, privateKey: string) {
    // Deploying Pause logic
    console.log(`Deploying Pause. please wait...`)

    const pause = await deployContractSDK(
        Pause__factory,
        privateKey,
        clientOperator
    )

    console.log(
        `Pause deployed ${
            (await getContractInfo(pause.toString())).evm_address
        }`
    )

    return pause
}

export async function deployERC20(clientOperator: Client, privateKey: string) {
    // Deploying ERC20 logic
    console.log(`Deploying ERC20. please wait...`)

    const erc20 = await deployContractSDK(
        ERC20__factory,
        privateKey,
        clientOperator
    )

    console.log(
        `ERC20 deployed ${
            (await getContractInfo(erc20.toString())).evm_address
        }`
    )

    return erc20
}

export async function deployERC1410(
    clientOperator: Client,
    privateKey: string
) {
    // Deploying ERC1410 logic
    console.log(`Deploying ERC1410. please wait...`)

    const erc1410 = await deployContractSDK(
        ERC1410ScheduledSnapshot__factory,
        privateKey,
        clientOperator
    )

    console.log(
        `ERC1410 deployed ${
            (await getContractInfo(erc1410.toString())).evm_address
        }`
    )

    return erc1410
}

export async function deployERC1594(
    clientOperator: Client,
    privateKey: string
) {
    // Deploying ERC1594 logic
    console.log(`Deploying ERC1594. please wait...`)

    const erc1594 = await deployContractSDK(
        ERC1594__factory,
        privateKey,
        clientOperator
    )

    console.log(
        `ERC1594 deployed ${
            (await getContractInfo(erc1594.toString())).evm_address
        }`
    )

    return erc1594
}

export async function deployERC1643(
    clientOperator: Client,
    privateKey: string
) {
    // Deploying ERC1643 logic
    console.log(`Deploying ERC1643. please wait...`)

    const erc1643 = await deployContractSDK(
        ERC1643__factory,
        privateKey,
        clientOperator
    )

    console.log(
        `ERC1643 deployed ${
            (await getContractInfo(erc1643.toString())).evm_address
        }`
    )

    return erc1643
}

export async function deployERC1644(
    clientOperator: Client,
    privateKey: string
) {
    // Deploying ERC1644logic
    console.log(`Deploying ERC1644. please wait...`)

    const erc1644 = await deployContractSDK(
        ERC1644__factory,
        privateKey,
        clientOperator
    )

    console.log(
        `ERC1644 deployed ${
            (await getContractInfo(erc1644.toString())).evm_address
        }`
    )

    return erc1644
}

export async function deploySnapshots(
    clientOperator: Client,
    privateKey: string
) {
    // Deploying Snpashots logic
    console.log(`Deploying Snapshots. please wait...`)

    const snapshots = await deployContractSDK(
        Snapshots__factory,
        privateKey,
        clientOperator
    )

    console.log(
        `Snapshots deployed ${
            (await getContractInfo(snapshots.toString())).evm_address
        }`
    )

    return snapshots
}

export async function deployDiamondFacet(
    clientOperator: Client,
    privateKey: string
) {
    // Deploying Diamond cut logic
    console.log(`Deploying Diamond Facet. please wait...`)

    const diamondFacet = await deployContractSDK(
        DiamondFacet__factory,
        privateKey,
        clientOperator
    )

    console.log(
        `Diamond Facet deployed ${
            (await getContractInfo(diamondFacet.toString())).evm_address
        }`
    )

    return diamondFacet
}

export async function deployEquity(clientOperator: Client, privateKey: string) {
    // Deploying Equity logic
    console.log(`Deploying Equity. please wait...`)

    const equity = await deployContractSDK(
        EquityUSA__factory,
        privateKey,
        clientOperator
    )

    console.log(
        `Equity deployed ${
            (await getContractInfo(equity.toString())).evm_address
        }`
    )

    return equity
}

export async function deployBond(clientOperator: Client, privateKey: string) {
    // Deploying Equity logic
    console.log(`Deploying Bond. please wait...`)

    const bond = await deployContractSDK(
        BondUSA__factory,
        privateKey,
        clientOperator
    )

    console.log(
        `Bond deployed ${(await getContractInfo(bond.toString())).evm_address}`
    )

    return bond
}

export async function deployScheduledSnapshots(
    clientOperator: Client,
    privateKey: string
) {
    // Deploying Schedled Snapshots logic
    console.log(`Deploying Scheduled Snapshots. please wait...`)

    const scheduledSnapshots = await deployContractSDK(
        ScheduledSnapshots__factory,
        privateKey,
        clientOperator
    )

    console.log(
        `Scheudled Snapshots deployed ${
            (await getContractInfo(scheduledSnapshots.toString())).evm_address
        }`
    )

    return scheduledSnapshots
}

export async function deployCorporateActionsSecurity(
    clientOperator: Client,
    privateKey: string
) {
    // Deploying Corproate Actions logic
    console.log(`Deploying Corporate Actions. please wait...`)

    const corporateActionsSecurity = await deployContractSDK(
        CorporateActionsSecurity__factory,
        privateKey,
        clientOperator
    )

    console.log(
        `Corporate Actions deployed ${
            (await getContractInfo(corporateActionsSecurity.toString()))
                .evm_address
        }`
    )

    return corporateActionsSecurity
}

export async function deployLock(clientOperator: Client, privateKey: string) {
    // Deploying Lock logic
    console.log(`Deploying Lock. please wait...`)

    const lock = await deployContractSDK(
        Lock__factory,
        privateKey,
        clientOperator
    )

    console.log(
        `Lock deployed ${(await getContractInfo(lock.toString())).evm_address}`
    )

    return lock
}

export async function deployTransferAndLock(
    clientOperator: Client,
    privateKey: string
) {
    // Deploying Lock logic
    console.log(`Deploying TransferAndLock. please wait...`)

    const transferAndLock = await deployContractSDK(
        TransferAndLock__factory,
        privateKey,
        clientOperator
    )

    console.log(
        `TransferAndLock deployed ${
            (await getContractInfo(transferAndLock.toString())).evm_address
        }`
    )

    return transferAndLock
}
