import { expect } from 'chai'
import { ethers } from 'hardhat'
import {
    type BusinessLogicResolver,
    BusinessLogicResolver__factory,
    type Factory,
    Factory__factory,
    type Diamond,
    type DiamondFacet,
    type DiamondLoupeFacet,
    DiamondLoupeFacet__factory,
    type AccessControl,
    type Pause,
    type ControlList,
    type ERC20,
    type ERC1644,
    type ERC1410ScheduledSnapshot,
    type ERC1594,
    type ERC1643,
    type Equity,
    type Snapshots,
    type ScheduledSnapshots,
    type CorporateActionsSecurity,
    Snapshots__factory,
    ERC1594__factory,
    EquityUSA__factory,
    BondUSA__factory,
    ERC1644__factory,
    ControlList__factory,
    Pause__factory,
    AccessControl__factory,
    ERC1643__factory,
    ERC20__factory,
    ERC1410ScheduledSnapshot__factory,
    CorporateActionsSecurity__factory,
    ScheduledSnapshots__factory,
    DiamondFacet__factory,
    Diamond__factory,
    type Cap,
    type Bond,
    Cap__factory,
    Lock__factory,
    Lock,
    TransferAndLock,
} from '../../typechain-types'
import { Wallet } from 'ethers'
import { getClient, toEvmAddress } from '../../scripts/utils'
import { toHashgraphKey } from '../../scripts/deploy'
import {
    _DEFAULT_ADMIN_ROLE,
    _CONTROL_LIST_ROLE,
    _CORPORATE_ACTION_ROLE,
    _ISSUER_ROLE,
    _CONTROLLER_ROLE,
    _PAUSER_ROLE,
} from '../../scripts/constants'
import {
    SecurityData,
    Rbac,
    EquityData,
    DividendType,
    EquityDetailsData,
    ERC20MetadataInfo,
    AdditionalSecurityData,
    FactoryRegulationData,
    RegulationType,
    RegulationSubType,
} from '../../scripts/factory'

const _MINUTE_1 = 6000
const _BUSINESS_LOGIC_COUNT = 17
const _PARTITION_ID_1 =
    '0x0000000000000000000000000000000000000000000000000000000000000001'

enum VersionStatus {
    NONE = 0,
    ACTIVATED = 1,
    DEACTIVATED = 2,
}

interface BusinessLogicRegistryData {
    businessLogicKey: string
    businessLogicAddress: string
}

const businessLogicResolverAddress = '0.0.3532144'
const factoryAddress = '0.0.3532205'
const accessControlAddress = '0.0.3532148'
const capAddress = '0.0.3532152'
const controlListAddress = '0.0.3532155'
const pauseAddress = '0.0.3532157'
const erc20Address = '0.0.3532163'
const erc1410Address = '0.0.3532166'
const erc1594Address = '0.0.3532169'
const erc1643Address = '0.0.3532171'
const erc1644Address = '0.0.3532174'
const snapshotsAddress = '0.0.3532177'
const diamondFacetAddress = '0.0.3532179'
const equityAddress = '0.0.3532182'
const bondAddress = '0.0.3532185'
const scheduledSnapshotsAddress = '0.0.3532188'
const corporateActionsAddress = '0.0.3532190'
const lockAddress = '0.0.3532160'
const transferandLockAddress = '0.0.3532194'

describe('Demo RedSwam', () => {
    let businessLogicResolver: BusinessLogicResolver,
        factory: Factory,
        diamond: Diamond,
        diamondFacet: DiamondFacet,
        cap: Cap,
        diamondLoupeFacet: DiamondLoupeFacet,
        accessControl: AccessControl,
        pause: Pause,
        controlList: ControlList,
        erc20: ERC20,
        erc1644: ERC1644,
        erc1410: ERC1410ScheduledSnapshot,
        erc1594: ERC1594,
        erc1643: ERC1643,
        equity: Equity,
        bond: Bond,
        snapshots: Snapshots,
        scheduledSnapshots: ScheduledSnapshots,
        corporateActions: CorporateActionsSecurity,
        lock: Lock,
        transferAndLock: TransferAndLock

    async function deployEquityFromFactory(
        adminAccount: string,
        signer_A: Wallet,
        isWhiteList: boolean,
        isControllable: boolean,
        isMultiPartition: boolean,
        name: string,
        symbol: string,
        decimals: number,
        isin: string,
        votingRight: boolean,
        informationRight: boolean,
        liquidationRight: boolean,
        subscriptionRight: boolean,
        convertionRight: boolean,
        redemptionRight: boolean,
        putRight: boolean,
        dividendRight: DividendType,
        currency: string,
        numberOfShares: number,
        nominalValue: number
    ) {
        const rbacAdmin: Rbac = {
            role: _DEFAULT_ADMIN_ROLE,
            members: [adminAccount],
        }
        const rbacs: Rbac[] = [rbacAdmin]
        const businessLogicKeys: string[] = [
            await diamondFacet.getStaticResolverKey(),
            await accessControl.getStaticResolverKey(),
            await pause.getStaticResolverKey(),
            await cap.getStaticResolverKey(),
            await controlList.getStaticResolverKey(),
            await erc20.getStaticResolverKey(),
            await erc1644.getStaticResolverKey(),
            await erc1410.getStaticResolverKey(),
            await erc1594.getStaticResolverKey(),
            await erc1643.getStaticResolverKey(),
            await equity.getStaticResolverKey(),
            await snapshots.getStaticResolverKey(),
            await scheduledSnapshots.getStaticResolverKey(),
            await corporateActions.getStaticResolverKey(),
            await lock.getStaticResolverKey(),
            await transferAndLock.getStaticResolverKey(),
        ]
        const resolver = businessLogicResolver.address

        const erc20MetadataInfo: ERC20MetadataInfo = {
            name,
            symbol,
            isin,
            decimals,
        }

        const security: SecurityData = {
            isMultiPartition,
            resolver,
            businessLogicKeys,
            rbacs,
            isControllable,
            isWhiteList,
            maxSupply: numberOfShares,
            erc20MetadataInfo,
        }

        const equityDetails: EquityDetailsData = {
            votingRight: votingRight,
            informationRight: informationRight,
            liquidationRight: liquidationRight,
            subscriptionRight: subscriptionRight,
            convertionRight: convertionRight,
            redemptionRight: redemptionRight,
            putRight: putRight,
            dividendRight: dividendRight,
            currency: currency,
            nominalValue: nominalValue,
        }

        const equityData: EquityData = {
            security,
            equityDetails,
        }

        const additionalSecurityData: AdditionalSecurityData = {
            countriesControlListType: true,
            listOfCountries: 'ES,FR,CH',
            info: 'nothing',
        }

        const factoryRegulationData: FactoryRegulationData = {
            regulationType: RegulationType.REG_S,
            regulationSubType: RegulationSubType.NONE,
            additionalSecurityData: additionalSecurityData,
        }

        console.log('Deploying Security FROM FACTORY')
        const result = await factory.deployEquity(
            equityData,
            factoryRegulationData
        )
        const events = (await result.wait()).events!
        const deployedEquityEvent = events.find(
            (e) => e.event == 'EquityDeployed'
        )
        const equityAddress = deployedEquityEvent!.args!.equityAddress

        console.log(`Deployed Security From Factory : ${equityAddress}`)

        diamond = new ethers.Contract(
            await toEvmAddress(equityAddress, true),
            Diamond__factory.abi,
            signer_A
        ) as Diamond
    }

    it('Demo RedSwam', async () => {
        const hre = require('hardhat')
        const hreConfig = hre.network.config

        const client_A = getClient()
        const account_A_account: string = hreConfig.accounts[1].account
        const account_A_privateKey: string = hreConfig.accounts[1].privateKey
        const account_A_isED25519 = false
        client_A.setOperator(
            account_A_account,
            toHashgraphKey(account_A_privateKey, account_A_isED25519)
        )
        const account_A = await toEvmAddress(account_A_account, false)

        const client_B = getClient()
        const account_B_account: string = hreConfig.accounts[2].account
        const account_B_privateKey: string = hreConfig.accounts[2].privateKey
        const account_B_isED25519 = false
        client_B.setOperator(
            account_B_account,
            toHashgraphKey(account_B_privateKey, account_B_isED25519)
        )
        const account_B = await toEvmAddress(account_B_account, false)

        const client_C = getClient()
        const account_C_account: string = hreConfig.accounts[3].account
        const account_C_privateKey: string = hreConfig.accounts[3].privateKey
        const account_C_isED25519 = false
        client_C.setOperator(
            account_C_account,
            toHashgraphKey(account_C_privateKey, account_C_isED25519)
        )
        const account_C = await toEvmAddress(account_C_account, false)

        const client_I = getClient()
        const account_I_account: string = hreConfig.accounts[4].account
        const account_I_privateKey: string = hreConfig.accounts[4].privateKey
        const account_I_isED25519 = false
        client_I.setOperator(
            account_I_account,
            toHashgraphKey(account_I_privateKey, account_I_isED25519)
        )
        const account_I = await toEvmAddress(account_I_account, false)

        const client_P = getClient()
        const account_P_account: string = hreConfig.accounts[5].account
        const account_P_privateKey: string = hreConfig.accounts[5].privateKey
        const account_P_isED25519 = false
        client_P.setOperator(
            account_P_account,
            toHashgraphKey(account_P_privateKey, account_P_isED25519)
        )
        const account_P = await toEvmAddress(account_P_account, false)

        const client_Z = getClient()
        const account_Z_account: string = hreConfig.accounts[6].account
        const account_Z_privateKey: string = hreConfig.accounts[6].privateKey
        const account_Z_isED25519 = false
        client_Z.setOperator(
            account_Z_account,
            toHashgraphKey(account_Z_privateKey, account_Z_isED25519)
        )
        const account_Z = await toEvmAddress(account_Z_account, false)

        console.log('Account Z : ' + account_Z)
        console.log('Account A : ' + account_A)
        console.log('Account B : ' + account_B)
        console.log('Account C : ' + account_C)
        console.log('Account I : ' + account_I)
        console.log('Account P : ' + account_P)

        const url = 'http://127.0.0.1:7546'
        const customHttpProvider = await new ethers.providers.JsonRpcProvider(
            url
        )
        const signer_A = new Wallet(account_A_privateKey, customHttpProvider)
        // const signer_B = new Wallet(account_B_privateKey, customHttpProvider)
        const signer_C = new Wallet(account_C_privateKey, customHttpProvider)
        const signer_P = new Wallet(account_P_privateKey, customHttpProvider)
        const signer_I = new Wallet(account_I_privateKey, customHttpProvider)
        const signer_Z = new Wallet(account_Z_privateKey, customHttpProvider)

        businessLogicResolver = new ethers.Contract(
            await toEvmAddress(businessLogicResolverAddress, true),
            BusinessLogicResolver__factory.abi,
            signer_A
        ) as BusinessLogicResolver
        factory = new ethers.Contract(
            await toEvmAddress(factoryAddress, true),
            Factory__factory.abi,
            signer_A
        ) as Factory
        diamondFacet = new ethers.Contract(
            await toEvmAddress(diamondFacetAddress, true),
            DiamondFacet__factory.abi,
            signer_A
        ) as DiamondFacet
        diamondLoupeFacet = new ethers.Contract(
            await toEvmAddress(diamondFacetAddress, true),
            DiamondLoupeFacet__factory.abi,
            signer_A
        ) as DiamondLoupeFacet
        accessControl = new ethers.Contract(
            await toEvmAddress(accessControlAddress, true),
            AccessControl__factory.abi,
            signer_A
        ) as AccessControl
        pause = new ethers.Contract(
            await toEvmAddress(pauseAddress, true),
            Pause__factory.abi,
            signer_A
        ) as Pause
        cap = new ethers.Contract(
            await toEvmAddress(capAddress, true),
            Cap__factory.abi,
            signer_A
        ) as Cap
        controlList = new ethers.Contract(
            await toEvmAddress(controlListAddress, true),
            ControlList__factory.abi,
            signer_A
        ) as ControlList
        erc20 = new ethers.Contract(
            await toEvmAddress(erc20Address, true),
            ERC20__factory.abi,
            signer_A
        ) as ERC20
        erc1644 = new ethers.Contract(
            await toEvmAddress(erc1644Address, true),
            ERC1644__factory.abi,
            signer_A
        ) as ERC1644
        erc1410 = new ethers.Contract(
            await toEvmAddress(erc1410Address, true),
            ERC1410ScheduledSnapshot__factory.abi,
            signer_A
        ) as ERC1410ScheduledSnapshot
        erc1594 = new ethers.Contract(
            await toEvmAddress(erc1594Address, true),
            ERC1594__factory.abi,
            signer_A
        ) as ERC1594
        erc1643 = new ethers.Contract(
            await toEvmAddress(erc1643Address, true),
            ERC1643__factory.abi,
            signer_A
        ) as ERC1643
        equity = new ethers.Contract(
            await toEvmAddress(equityAddress, true),
            EquityUSA__factory.abi,
            signer_A
        ) as Equity
        bond = new ethers.Contract(
            await toEvmAddress(bondAddress, true),
            BondUSA__factory.abi,
            signer_A
        ) as Bond
        snapshots = new ethers.Contract(
            await toEvmAddress(snapshotsAddress, true),
            Snapshots__factory.abi,
            signer_A
        ) as Snapshots
        scheduledSnapshots = new ethers.Contract(
            await toEvmAddress(scheduledSnapshotsAddress, true),
            ScheduledSnapshots__factory.abi,
            signer_A
        ) as ScheduledSnapshots
        corporateActions = new ethers.Contract(
            await toEvmAddress(corporateActionsAddress, true),
            CorporateActionsSecurity__factory.abi,
            signer_A
        ) as CorporateActionsSecurity
        lock = new ethers.Contract(
            await toEvmAddress(lockAddress, true),
            Lock__factory.abi,
            signer_A
        ) as Lock
        transferAndLock = new ethers.Contract(
            await toEvmAddress(transferandLockAddress, true),
            Lock__factory.abi,
            signer_A
        ) as TransferAndLock

        console.log(`
        Deployed contracts:
            BusinessLogicResolver: ${businessLogicResolver.address},
            Factory: ${factory.address},
            DiamondFacet: 
                address: ${diamondFacet.address},
                key: ${await diamondFacet.getStaticResolverKey()},
                selectors: ${JSON.stringify(
                    await diamondFacet.getStaticFunctionSelectors()
                )},
            DiamondLoupeFacet: 
                address: ${diamondLoupeFacet.address},
                key: ${await diamondLoupeFacet.getStaticResolverKey()},
                selectors: ${JSON.stringify(
                    await diamondLoupeFacet.getStaticFunctionSelectors()
                )},
            AccessControl: 
                address: ${accessControl.address},
                key: ${await accessControl.getStaticResolverKey()},
                selectors: ${JSON.stringify(
                    await accessControl.getStaticFunctionSelectors()
                )},
            Cap: 
                address: ${cap.address},
                key: ${await cap.getStaticResolverKey()},
                selectors: ${JSON.stringify(
                    await cap.getStaticFunctionSelectors()
                )},
            Pause: 
                address: ${pause.address},
                key: ${await pause.getStaticResolverKey()},
                selectors: ${JSON.stringify(
                    await pause.getStaticFunctionSelectors()
                )},
            ControlList: 
                address: ${controlList.address},
                key: ${await controlList.getStaticResolverKey()},
                selectors: ${JSON.stringify(
                    await controlList.getStaticFunctionSelectors()
                )},
            ERC20: 
                address: ${erc20.address},
                key: ${await erc20.getStaticResolverKey()},
                selectors: ${JSON.stringify(
                    await erc20.getStaticFunctionSelectors()
                )},
            ERC1644: 
                address: ${erc1644.address},
                key: ${await erc1644.getStaticResolverKey()},
                selectors: ${JSON.stringify(
                    await erc1644.getStaticFunctionSelectors()
                )},
            ERC1410: 
                address: ${erc1410.address},
                key: ${await erc1410.getStaticResolverKey()},
                selectors: ${JSON.stringify(
                    await erc1410.getStaticFunctionSelectors()
                )},
            ERC1594: 
                address: ${erc1594.address},
                key: ${await erc1594.getStaticResolverKey()},
                selectors: ${JSON.stringify(
                    await erc1594.getStaticFunctionSelectors()
                )},
            ERC1643: 
                address: ${erc1643.address},
                key: ${await erc1643.getStaticResolverKey()},
                selectors: ${JSON.stringify(
                    await erc1643.getStaticFunctionSelectors()
                )},
            Equity: 
                address: ${await equity.address},
                key: ${await equity.getStaticResolverKey()},
                selectors: ${JSON.stringify(
                    await equity.getStaticFunctionSelectors()
                )},
            Bond: 
                address: ${await bond.address},
                key: ${await bond.getStaticResolverKey()},
                selectors: ${JSON.stringify(
                    await bond.getStaticFunctionSelectors()
                )},
            Snapshots: 
                address: ${await snapshots.address},
                key: ${await snapshots.getStaticResolverKey()},
                selectors: ${JSON.stringify(
                    await snapshots.getStaticFunctionSelectors()
                )},
            ScheduledSnapshots: 
                address: ${await scheduledSnapshots.address},
                key: ${await scheduledSnapshots.getStaticResolverKey()},
                selectors: ${JSON.stringify(
                    await scheduledSnapshots.getStaticFunctionSelectors()
                )},
            CorporateActions: 
                address: ${await corporateActions.address},
                key: ${await corporateActions.getStaticResolverKey()},
                selectors: ${JSON.stringify(
                    await corporateActions.getStaticFunctionSelectors()
                )},
            Lock:
                address: ${await lock.address},
                key: ${await lock.getStaticResolverKey()},
                selectors: ${JSON.stringify(
                    await lock.getStaticFunctionSelectors()
                )},
            TransferAndLock:
                address: ${await transferAndLock.address},
                key: ${await transferAndLock.getStaticResolverKey()},
                selectors: ${JSON.stringify(
                    await transferAndLock.getStaticFunctionSelectors()
                )},

                `)

        const businessLogicRegistries: BusinessLogicRegistryData[] = [
            {
                businessLogicKey: await diamondFacet.getStaticResolverKey(),
                businessLogicAddress: diamondFacet.address,
            },
            {
                businessLogicKey: await accessControl.getStaticResolverKey(),
                businessLogicAddress: accessControl.address,
            },
            {
                businessLogicKey: await pause.getStaticResolverKey(),
                businessLogicAddress: pause.address,
            },
            {
                businessLogicKey: await cap.getStaticResolverKey(),
                businessLogicAddress: cap.address,
            },
            {
                businessLogicKey: await controlList.getStaticResolverKey(),
                businessLogicAddress: controlList.address,
            },
            {
                businessLogicKey: await erc20.getStaticResolverKey(),
                businessLogicAddress: erc20.address,
            },
            {
                businessLogicKey: await erc1644.getStaticResolverKey(),
                businessLogicAddress: erc1644.address,
            },
            {
                businessLogicKey: await erc1410.getStaticResolverKey(),
                businessLogicAddress: erc1410.address,
            },
            {
                businessLogicKey: await erc1594.getStaticResolverKey(),
                businessLogicAddress: erc1594.address,
            },
            {
                businessLogicKey: await erc1643.getStaticResolverKey(),
                businessLogicAddress: await erc1643.address,
            },
            {
                businessLogicKey: await equity.getStaticResolverKey(),
                businessLogicAddress: await equity.address,
            },
            {
                businessLogicKey: await snapshots.getStaticResolverKey(),
                businessLogicAddress: await snapshots.address,
            },
            {
                businessLogicKey:
                    await scheduledSnapshots.getStaticResolverKey(),
                businessLogicAddress: await scheduledSnapshots.address,
            },
            {
                businessLogicKey: await corporateActions.getStaticResolverKey(),
                businessLogicAddress: await corporateActions.address,
            },
            {
                businessLogicKey: await lock.getStaticResolverKey(),
                businessLogicAddress: await lock.address,
            },
            {
                businessLogicKey: await transferAndLock.getStaticResolverKey(),
                businessLogicAddress: await transferAndLock.address,
            },
        ]

        await businessLogicResolver.registerBusinessLogics(
            businessLogicRegistries
        )

        expect(await businessLogicResolver.getVersionStatus(1)).to.be.equal(
            VersionStatus.ACTIVATED
        )
        expect(
            await businessLogicResolver.getVersionStatus(
                await businessLogicResolver.getLatestVersion()
            )
        ).to.be.equal(VersionStatus.ACTIVATED)
        expect(
            (
                await businessLogicResolver.resolveLatestBusinessLogic(
                    await diamondFacet.getStaticResolverKey()
                )
            ).toUpperCase()
        ).to.be.equal(diamondFacet.address.toUpperCase())
        expect(
            (
                await businessLogicResolver.resolveLatestBusinessLogic(
                    await diamondFacet.getStaticResolverKey()
                )
            ).toUpperCase()
        ).to.be.equal(diamondLoupeFacet.address.toUpperCase())
        expect(
            (
                await businessLogicResolver.resolveLatestBusinessLogic(
                    await accessControl.getStaticResolverKey()
                )
            ).toUpperCase()
        ).to.be.equal(accessControl.address.toUpperCase())
        expect(
            (
                await businessLogicResolver.resolveLatestBusinessLogic(
                    await pause.getStaticResolverKey()
                )
            ).toUpperCase()
        ).to.be.equal(pause.address.toUpperCase())
        expect(
            (
                await businessLogicResolver.resolveLatestBusinessLogic(
                    await cap.getStaticResolverKey()
                )
            ).toUpperCase()
        ).to.be.equal(cap.address.toUpperCase())
        expect(
            (
                await businessLogicResolver.resolveLatestBusinessLogic(
                    await controlList.getStaticResolverKey()
                )
            ).toUpperCase()
        ).to.be.equal(controlList.address.toUpperCase())
        expect(
            (
                await businessLogicResolver.resolveLatestBusinessLogic(
                    await erc1644.getStaticResolverKey()
                )
            ).toUpperCase()
        ).to.be.equal(erc1644.address.toUpperCase())
        expect(
            (
                await businessLogicResolver.resolveLatestBusinessLogic(
                    await erc1410.getStaticResolverKey()
                )
            ).toUpperCase()
        ).to.be.equal(erc1410.address.toUpperCase())
        expect(
            (
                await businessLogicResolver.resolveLatestBusinessLogic(
                    await erc1594.getStaticResolverKey()
                )
            ).toUpperCase()
        ).to.be.equal(erc1594.address.toUpperCase())
        expect(
            (
                await businessLogicResolver.resolveLatestBusinessLogic(
                    await erc1643.getStaticResolverKey()
                )
            ).toUpperCase()
        ).to.be.equal(erc1643.address.toUpperCase())
        expect(
            (
                await businessLogicResolver.resolveLatestBusinessLogic(
                    await equity.getStaticResolverKey()
                )
            ).toUpperCase()
        ).to.be.equal(equity.address.toUpperCase())
        expect(
            (
                await businessLogicResolver.resolveLatestBusinessLogic(
                    await snapshots.getStaticResolverKey()
                )
            ).toUpperCase()
        ).to.be.equal(snapshots.address.toUpperCase())
        expect(
            (
                await businessLogicResolver.resolveLatestBusinessLogic(
                    await scheduledSnapshots.getStaticResolverKey()
                )
            ).toUpperCase()
        ).to.be.equal(scheduledSnapshots.address.toUpperCase())
        expect(
            (
                await businessLogicResolver.resolveLatestBusinessLogic(
                    await corporateActions.getStaticResolverKey()
                )
            ).toUpperCase()
        ).to.be.equal(corporateActions.address.toUpperCase())
        expect(
            (
                await businessLogicResolver.resolveLatestBusinessLogic(
                    await lock.getStaticResolverKey()
                )
            ).toUpperCase()
        ).to.be.equal(lock.address.toUpperCase())
        expect(
            (
                await businessLogicResolver.resolveLatestBusinessLogic(
                    await transferAndLock.getStaticResolverKey()
                )
            ).toUpperCase()
        ).to.be.equal(transferAndLock.address.toUpperCase())

        expect(await businessLogicResolver.getBusinessLogicCount()).to.be.equal(
            _BUSINESS_LOGIC_COUNT
        )
        expect(
            await businessLogicResolver.getBusinessLogicKeys(0, 30)
        ).to.be.deep.equal([
            await diamondFacet.getStaticResolverKey(),
            await accessControl.getStaticResolverKey(),
            await cap.getStaticResolverKey(),
            await pause.getStaticResolverKey(),
            await controlList.getStaticResolverKey(),
            await erc20.getStaticResolverKey(),
            await erc1644.getStaticResolverKey(),
            await erc1410.getStaticResolverKey(),
            await erc1594.getStaticResolverKey(),
            await erc1643.getStaticResolverKey(),
            await snapshots.getStaticResolverKey(),
            await equity.getStaticResolverKey(),
            await bond.getStaticResolverKey(),
            await scheduledSnapshots.getStaticResolverKey(),
            await corporateActions.getStaticResolverKey(),
            await lock.getStaticResolverKey(),
            await transferAndLock.getStaticResolverKey(),
        ])

        const TokenName = 'TEST_DEMO'
        const TokenSymbol = 'TD'
        const TokenDecimals = 6
        const TokenISIN = 'ABCDEF123456'
        const TokenType = 1 // equity
        const isWhiteList = false
        const isControllable = true
        const isMultiPartition = false
        const votingRight = true
        const informationRight = false
        const liquidationRight = true
        const subscriptionRight = false
        const convertionRight = true
        const redemptionRight = false
        const putRight = true
        const dividendRight = DividendType.PREFERRED
        const currency = '0x455552'
        const numberOfShares = 0
        const nominalValue = 100

        await deployEquityFromFactory(
            account_Z,
            signer_A,
            isWhiteList,
            isControllable,
            isMultiPartition,
            TokenName,
            TokenSymbol,
            TokenDecimals,
            TokenISIN,
            votingRight,
            informationRight,
            liquidationRight,
            subscriptionRight,
            convertionRight,
            redemptionRight,
            putRight,
            dividendRight,
            currency,
            numberOfShares,
            nominalValue
        )

        console.log(`    Diamond: ${diamond.address}`)

        const loupeFacet = diamondFacet.attach(diamond.address)

        console.log(`
        DiamondResume:
            DiamondLoupe.facets: ${JSON.stringify(
                await loupeFacet.getFacets({ gasLimit: 10000000 })
            )}
            DiamondLoupe.facetFunctionSelectors[diamondFacet]: ${JSON.stringify(
                await loupeFacet.getFacetFunctionSelectors(
                    await diamondFacet.getStaticResolverKey()
                )
            )}
            DiamondLoupe.facetFunctionSelectors[accessControl]: ${JSON.stringify(
                await loupeFacet.getFacetFunctionSelectors(
                    await accessControl.getStaticResolverKey()
                )
            )}
            DiamondLoupe.facetFunctionSelectors[pause]: ${JSON.stringify(
                await loupeFacet.getFacetFunctionSelectors(
                    await pause.getStaticResolverKey()
                )
            )}
            DiamondLoupe.facetFunctionSelectors[cap]: ${JSON.stringify(
                await loupeFacet.getFacetFunctionSelectors(
                    await cap.getStaticResolverKey()
                )
            )}
            DiamondLoupe.facetFunctionSelectors[controlList]: ${JSON.stringify(
                await loupeFacet.getFacetFunctionSelectors(
                    await controlList.getStaticResolverKey()
                )
            )}
            DiamondLoupe.facetFunctionSelectors[erc20]: ${JSON.stringify(
                await loupeFacet.getFacetFunctionSelectors(
                    await erc20.getStaticResolverKey()
                )
            )}
            DiamondLoupe.facetFunctionSelectors[erc1644]: ${JSON.stringify(
                await loupeFacet.getFacetFunctionSelectors(
                    await erc1644.getStaticResolverKey()
                )
            )}
            DiamondLoupe.facetFunctionSelectors[erc1410]: ${JSON.stringify(
                await loupeFacet.getFacetFunctionSelectors(
                    await erc1410.getStaticResolverKey()
                )
            )}
            DiamondLoupe.facetFunctionSelectors[erc1594]: ${JSON.stringify(
                await loupeFacet.getFacetFunctionSelectors(
                    await erc1594.getStaticResolverKey()
                )
            )}
            DiamondLoupe.facetFunctionSelectors[erc1643]: ${JSON.stringify(
                await loupeFacet.getFacetFunctionSelectors(
                    await erc1643.getStaticResolverKey()
                )
            )}
            DiamondLoupe.facetFunctionSelectors[equity]: ${JSON.stringify(
                await loupeFacet.getFacetFunctionSelectors(
                    await equity.getStaticResolverKey()
                )
            )}
            DiamondLoupe.facetFunctionSelectors[snapshots]: ${JSON.stringify(
                await loupeFacet.getFacetFunctionSelectors(
                    await snapshots.getStaticResolverKey()
                )
            )}
            DiamondLoupe.facetFunctionSelectors[scheduledSnapshots]: ${JSON.stringify(
                await loupeFacet.getFacetFunctionSelectors(
                    await scheduledSnapshots.getStaticResolverKey()
                )
            )}
            DiamondLoupe.facetFunctionSelectors[corporateActions]: ${JSON.stringify(
                await loupeFacet.getFacetFunctionSelectors(
                    await corporateActions.getStaticResolverKey()
                )
            )}
            DiamondLoupe.facetFunctionSelectors[lock]: ${JSON.stringify(
                await loupeFacet.getFacetFunctionSelectors(
                    await lock.getStaticResolverKey()
                )
            )}
            DiamondLoupe.facetFunctionSelectors[transferAndLock]: ${JSON.stringify(
                await loupeFacet.getFacetFunctionSelectors(
                    await transferAndLock.getStaticResolverKey()
                )
            )}
            DiamondLoupe.facetKeys: ${JSON.stringify(
                await loupeFacet.getFacetKeys()
            )}
            DiamondLoupe.facetAddresses: ${JSON.stringify(
                await loupeFacet.getFacetAddresses()
            )}
            DiamondLoupe.facetKey(0xb8fb063e): ${await loupeFacet.getFacetKeyBySelector(
                '0xb8fb063e'
            )}
            DiamondLoupe.facet(0xb8fb063e): ${await loupeFacet.getFacet(
                await diamondFacet.getStaticResolverKey()
            )}
            DiamondLoupe.facetAddress(0xb8fb063e): ${await loupeFacet.getFacetAddress(
                '0xb8fb063e'
            )}
            DiamondLoupe.supportsInterface(0xb8fb063e): ${JSON.stringify(
                await loupeFacet.supportsInterface('0xb8fb063e')
            )}
            
            `)

        let accessControlFacet = accessControl.attach(diamond.address)

        const capFacet = cap.attach(diamond.address)

        let pauseFacet = pause.attach(diamond.address)

        let controlListFacet = controlList.attach(diamond.address)

        const erc20Facet = erc20.attach(diamond.address)

        let erc1410Facet = erc1410.attach(diamond.address)

        let equityFacet = equity.attach(diamond.address)

        const snapshotsFacet = snapshots.attach(diamond.address)

        const scheduledSnapshotsFacet = scheduledSnapshots.attach(
            diamond.address
        )

        // --------------------------------------------
        // --------------------------------------------
        // DEMO STEPS TEST
        // --------------------------------------------
        // --------------------------------------------

        console.log(`
        
        
                --------------------------------
                    DEMO STEPS 
                --------------------------------
        
                `)

        console.log('Check token metadata')
        const metadata = await erc20Facet.getERC20Metadata()
        expect(metadata.info.name).to.equal(TokenName)
        expect(metadata.info.symbol).to.equal(TokenSymbol)
        expect(metadata.info.decimals).to.equal(TokenDecimals)
        expect(metadata.info.isin).to.equal(TokenISIN)
        expect(metadata.securityType).to.equal(TokenType)

        console.log('Check token name, symbol and decimals')
        const retrieved_name = await erc20Facet.name()
        const retrieved_symbol = await erc20Facet.symbol()
        const retrieved_decimals = await erc20Facet.decimals()

        expect(retrieved_name).to.equal(TokenName)
        expect(retrieved_symbol).to.equal(TokenSymbol)
        expect(retrieved_decimals).to.equal(TokenDecimals)

        console.log('Check equity metadata')
        const equityMetadata = await equityFacet.getEquityDetails()
        expect(equityMetadata.votingRight).to.equal(votingRight)
        expect(equityMetadata.informationRight).to.equal(informationRight)
        expect(equityMetadata.liquidationRight).to.equal(liquidationRight)
        expect(equityMetadata.subscriptionRight).to.equal(subscriptionRight)
        expect(equityMetadata.convertionRight).to.equal(convertionRight)
        expect(equityMetadata.redemptionRight).to.equal(redemptionRight)
        expect(equityMetadata.putRight).to.equal(putRight)
        expect(equityMetadata.dividendRight).to.equal(dividendRight)

        console.log('Check max Supply')
        const maxSupply = await capFacet.getMaxSupply()
        expect(maxSupply).to.equal(numberOfShares)

        console.log(
            'Add account "B" to blakclist using account "I" => fails (no permission)'
        )

        controlListFacet = controlListFacet.connect(signer_I)
        await expect(
            (await controlListFacet.addToControlList(account_B)).wait()
        ).to.eventually.be.rejectedWith(Error)

        console.log(
            'Grant issuer, control list, corporate action and controller roles to account "I" using account "Z" => succeeds'
        )
        accessControlFacet = accessControlFacet.connect(signer_Z)
        await accessControlFacet.grantRole(_ISSUER_ROLE, account_I)
        await accessControlFacet.grantRole(_CONTROL_LIST_ROLE, account_I)
        await accessControlFacet.grantRole(_CORPORATE_ACTION_ROLE, account_I)
        await accessControlFacet.grantRole(_CONTROLLER_ROLE, account_I)

        console.log(
            'Grant pauser role to account "P" using account "Z" => succeeds'
        )
        accessControlFacet = accessControlFacet.connect(signer_Z)
        await accessControlFacet.grantRole(_PAUSER_ROLE, account_P)

        console.log('Check current roles')
        const adminMemberCount = await accessControlFacet.getRoleMemberCount(
            _DEFAULT_ADMIN_ROLE
        )
        const issuerMemberCount = await accessControlFacet.getRoleMemberCount(
            _ISSUER_ROLE
        )
        const controlListMemberCount =
            await accessControlFacet.getRoleMemberCount(_CONTROL_LIST_ROLE)
        const corporateActionsMemberCount =
            await accessControlFacet.getRoleMemberCount(_CORPORATE_ACTION_ROLE)
        const controllerMemberCount =
            await accessControlFacet.getRoleMemberCount(_CONTROLLER_ROLE)
        const pauserMemberCount = await accessControlFacet.getRoleMemberCount(
            _PAUSER_ROLE
        )
        expect(adminMemberCount).to.be.equal(1)
        expect(issuerMemberCount).to.be.equal(1)
        expect(controlListMemberCount).to.be.equal(1)
        expect(corporateActionsMemberCount).to.be.equal(1)
        expect(controllerMemberCount).to.be.equal(1)
        expect(pauserMemberCount).to.be.equal(1)
        const adminMembers = await accessControlFacet.getRoleMembers(
            _DEFAULT_ADMIN_ROLE,
            0,
            adminMemberCount
        )
        const issuerMembers = await accessControlFacet.getRoleMembers(
            _ISSUER_ROLE,
            0,
            issuerMemberCount
        )
        const controlListMembers = await accessControlFacet.getRoleMembers(
            _CONTROL_LIST_ROLE,
            0,
            controlListMemberCount
        )
        const corporateActionsMembers = await accessControlFacet.getRoleMembers(
            _CORPORATE_ACTION_ROLE,
            0,
            corporateActionsMemberCount
        )
        const controllerMembers = await accessControlFacet.getRoleMembers(
            _CONTROLLER_ROLE,
            0,
            controllerMemberCount
        )
        const pauserMembers = await accessControlFacet.getRoleMembers(
            _PAUSER_ROLE,
            0,
            pauserMemberCount
        )
        expect(adminMembers.length).to.be.equal(adminMemberCount)
        expect(adminMembers[0].toUpperCase()).to.be.equal(
            account_Z.toUpperCase()
        )
        expect(issuerMembers.length).to.be.equal(issuerMemberCount)
        expect(issuerMembers[0].toUpperCase()).to.be.equal(
            account_I.toUpperCase()
        )
        expect(controlListMembers.length).to.be.equal(controlListMemberCount)
        expect(controlListMembers[0].toUpperCase()).to.be.equal(
            account_I.toUpperCase()
        )
        expect(corporateActionsMembers.length).to.be.equal(
            corporateActionsMemberCount
        )
        expect(corporateActionsMembers[0].toUpperCase()).to.be.equal(
            account_I.toUpperCase()
        )
        expect(controllerMembers.length).to.be.equal(controllerMemberCount)
        expect(controllerMembers[0].toUpperCase()).to.be.equal(
            account_I.toUpperCase()
        )
        expect(pauserMembers.length).to.be.equal(pauserMemberCount)
        expect(pauserMembers[0].toUpperCase()).to.be.equal(
            account_P.toUpperCase()
        )

        console.log(
            'Add account "B" to blacklist using account "I" => succeeds'
        )
        controlListFacet = controlListFacet.connect(signer_I)
        await controlListFacet.addToControlList(account_B)

        console.log(
            'Issue 10.000 securities to account "B" using account "I" => fails (B is blacklisted)'
        )
        erc1410Facet = erc1410Facet.connect(signer_I)
        await expect(
            (
                await erc1410Facet.issueByPartition(
                    _PARTITION_ID_1,
                    account_B,
                    10000,
                    '0x'
                )
            ).wait()
        ).to.eventually.be.rejectedWith(Error)

        console.log(
            'Issue 10.000 securities to account "A" using account "I" => succeeds'
        )
        erc1410Facet = erc1410Facet.connect(signer_I)
        await erc1410Facet.issueByPartition(
            _PARTITION_ID_1,
            account_A,
            10000,
            '0x'
        )
        let totalSupply = await erc1410Facet.totalSupply()
        let accountABalance = await erc1410Facet.balanceOf(account_A)
        let accountABalanceByPartition =
            await erc1410Facet.balanceOfByPartition(_PARTITION_ID_1, account_A)
        expect(totalSupply.toNumber()).to.be.equal(10000)
        expect(accountABalance.toNumber()).to.be.equal(10000)
        expect(accountABalanceByPartition.toNumber()).to.be.equal(
            accountABalance.toNumber()
        )

        console.log(
            'Transfer 500 securities from account "A" to "B" => fails (B is blacklisted)'
        )
        erc1410Facet = erc1410Facet.connect(signer_A)
        await expect(
            (
                await erc1410Facet.transferByPartition(
                    _PARTITION_ID_1,
                    account_B,
                    500,
                    '0x'
                )
            ).wait()
        ).to.eventually.be.rejectedWith(Error)

        console.log(
            'Transfer 500 securities from account "A" to "C" => succeeds'
        )
        erc1410Facet = erc1410Facet.connect(signer_A)
        await erc1410Facet.transferByPartition(
            _PARTITION_ID_1,
            account_C,
            500,
            '0x'
        )

        console.log(
            'Schedule dividends for 1 minute later (1 unit per security) using account "I" => succeeds'
        )
        equityFacet = equityFacet.connect(signer_I)
        const currentTimeInSeconds = Math.floor(new Date().getTime() / 1000) + 1
        const dividendsRecordDateInSeconds =
            currentTimeInSeconds + _MINUTE_1 / 1000
        const dividendsExecutionDateInSeconds =
            currentTimeInSeconds + 10 * (_MINUTE_1 / 1000)
        const dividendsAmountPerEquity = 1
        const result = await equityFacet.setDividends({
            recordDate: dividendsRecordDateInSeconds.toString(),
            executionDate: dividendsExecutionDateInSeconds.toString(),
            amount: dividendsAmountPerEquity,
        })
        const events = (await result.wait()).events!
        const setDividendEvent = events.find((e) => e.event == 'DividendSet')
        const dividendId = setDividendEvent!.args!.dividendId
        let dividendDetails = await equityFacet.getDividends(dividendId)
        expect(dividendDetails.dividend.recordDate.toNumber()).to.be.equal(
            dividendsRecordDateInSeconds
        )
        expect(dividendDetails.dividend.executionDate.toNumber()).to.be.equal(
            dividendsExecutionDateInSeconds
        )
        expect(dividendDetails.dividend.amount.toNumber()).to.be.equal(
            dividendsAmountPerEquity
        )
        expect(dividendDetails.snapshotId.toNumber()).to.be.equal(0)
        const scheduledSnapshotsCount =
            await scheduledSnapshotsFacet.scheduledSnapshotCount()
        const scheduledSnapshotsList =
            await scheduledSnapshotsFacet.getScheduledSnapshots(0, 1000)
        expect(scheduledSnapshotsCount.toNumber()).to.be.equal(1)
        expect(scheduledSnapshotsList.length).to.be.equal(1)
        expect(
            scheduledSnapshotsList[0].scheduledTimestamp.toNumber()
        ).to.be.equal(dividendsRecordDateInSeconds)
        expect(scheduledSnapshotsList[0].data).to.be.equal(
            '0x0000000000000000000000000000000000000000000000000000000000000001'
        )

        console.log('Add account "C" to blacklist using account I => succeeds')
        controlListFacet = controlListFacet.connect(signer_I)
        await controlListFacet.addToControlList(account_C)

        console.log(
            'Transfer 1 securities from account "C" to "A" => fails (C is blacklisted)'
        )
        erc1410Facet = erc1410Facet.connect(signer_C)
        await expect(
            (
                await erc1410Facet.transferByPartition(
                    _PARTITION_ID_1,
                    account_A,
                    1,
                    '0x'
                )
            ).wait()
        ).to.eventually.be.rejectedWith(Error)

        console.log(
            'Remove account "C" from blacklist using account "I" => succeeds'
        )
        controlListFacet = controlListFacet.connect(signer_I)
        await controlListFacet.removeFromControlList(account_C)

        console.log('Wait 1 minute') // wait 1 minute
        await new Promise((f) => setTimeout(f, _MINUTE_1 + 2000))

        console.log(
            'Transfer 500 securities from account "C" to "A" => succeeds'
        )
        erc1410Facet = erc1410Facet.connect(signer_C)
        await erc1410Facet.transferByPartition(
            _PARTITION_ID_1,
            account_A,
            500,
            '0x'
        )

        console.log(
            'Check accounts entitled dividends and accounts current balances'
        )
        dividendDetails = await equityFacet.getDividends(dividendId)
        const dividend_For_A = await equityFacet.getDividendsFor(
            dividendId,
            account_A
        )
        const dividend_For_C = await equityFacet.getDividendsFor(
            dividendId,
            account_C
        )
        expect(dividendDetails.snapshotId.toNumber()).to.be.equal(1)
        const accountABalanceAtSnapshot =
            await snapshotsFacet.balanceOfAtSnapshot(
                dividendDetails.snapshotId,
                account_A
            )
        const accountCBalanceAtSnapshot =
            await snapshotsFacet.balanceOfAtSnapshot(
                dividendDetails.snapshotId,
                account_C
            )
        accountABalance = await erc1410Facet.balanceOf(account_A)
        accountABalanceByPartition = await erc1410Facet.balanceOfByPartition(
            _PARTITION_ID_1,
            account_A
        )
        let accountCBalance = await erc1410Facet.balanceOf(account_C)
        let accountCBalanceByPartition =
            await erc1410Facet.balanceOfByPartition(_PARTITION_ID_1, account_C)
        expect(accountABalanceAtSnapshot).to.be.equal(9500)
        expect(accountCBalanceAtSnapshot).to.be.equal(500)
        expect(dividend_For_A.tokenBalance).to.be.equal(9500)
        expect(dividend_For_C.tokenBalance).to.be.equal(500)
        expect(accountABalance).to.be.equal(10000)
        expect(accountCBalance).to.be.equal(0)
        expect(accountABalanceByPartition).to.be.equal(accountABalance)
        expect(accountCBalanceByPartition).to.be.equal(accountCBalance)

        console.log('Redeem 1.000 securities from account "A" => succeeds')
        erc1410Facet = erc1410Facet.connect(signer_A)
        await erc1410Facet.redeemByPartition(_PARTITION_ID_1, 1000, '0x')

        console.log('Check current balances and total supply')
        totalSupply = await erc1410Facet.totalSupply()
        accountABalance = await erc1410Facet.balanceOf(account_A)
        accountABalanceByPartition = await erc1410Facet.balanceOfByPartition(
            _PARTITION_ID_1,
            account_A
        )
        expect(totalSupply).to.be.equal(9000)
        expect(accountABalance).to.be.equal(9000)
        expect(accountABalanceByPartition).to.be.equal(accountABalance)

        console.log(
            'Force transfer 500 securities from account "A" to "C" using account "I" => succeeds'
        )
        erc1410Facet = erc1410Facet.connect(signer_I)
        await erc1410Facet.controllerTransferByPartition(
            _PARTITION_ID_1,
            account_A,
            account_C,
            500,
            '0x',
            '0x'
        )

        console.log(
            'Force redeem 100 securities from account "C" using account "I" => succeeds'
        )
        erc1410Facet = erc1410Facet.connect(signer_I)
        await erc1410Facet.controllerRedeemByPartition(
            _PARTITION_ID_1,
            account_C,
            100,
            '0x',
            '0x'
        )

        console.log('Check current balances and total supply')
        totalSupply = await erc1410Facet.totalSupply()
        accountABalance = await erc1410Facet.balanceOf(account_A)
        accountABalanceByPartition = await erc1410Facet.balanceOfByPartition(
            _PARTITION_ID_1,
            account_A
        )
        accountCBalance = await erc1410Facet.balanceOf(account_C)
        accountCBalanceByPartition = await erc1410Facet.balanceOfByPartition(
            _PARTITION_ID_1,
            account_C
        )
        expect(totalSupply).to.be.equal(8900)
        expect(accountABalance).to.be.equal(8500)
        expect(accountCBalance).to.be.equal(400)
        expect(accountABalanceByPartition).to.be.equal(accountABalance)
        expect(accountCBalanceByPartition).to.be.equal(accountCBalance)

        console.log(
            'Revoke controller role from account "I" using account "Z" => succeeds'
        )
        accessControlFacet = accessControlFacet.connect(signer_Z)
        await accessControlFacet.revokeRole(_CONTROLLER_ROLE, account_I)

        console.log(
            'Force transfer 500 securities from account "A" to "C" using account "I" => fails (no permission)'
        )
        erc1410Facet = erc1410Facet.connect(signer_I)
        await expect(
            (
                await erc1410Facet.controllerTransferByPartition(
                    _PARTITION_ID_1,
                    account_A,
                    account_C,
                    500,
                    '0x',
                    '0x'
                )
            ).wait()
        ).to.eventually.be.rejectedWith(Error)

        console.log(
            'Force redeem 100 securities from account "C" using account "I" => fails (no permission)'
        )
        erc1410Facet = erc1410Facet.connect(signer_I)
        await expect(
            (
                await erc1410Facet.controllerRedeemByPartition(
                    _PARTITION_ID_1,
                    account_C,
                    100,
                    '0x',
                    '0x'
                )
            ).wait()
        ).to.eventually.be.rejectedWith(Error)

        console.log('Pause security token using account "P" => succeeds')
        pauseFacet = pauseFacet.connect(signer_P)
        await pauseFacet.pause()

        console.log(
            'Grant controller role to  account “I” using account “Z” => fails (paused)'
        )
        accessControlFacet = accessControlFacet.connect(signer_Z)
        await expect(
            (
                await accessControlFacet.grantRole(_CONTROLLER_ROLE, account_I)
            ).wait()
        ).to.eventually.be.rejectedWith(Error)

        console.log(
            'Transfer 500 securities from account “A” to “C” => fails (paused)'
        )
        erc1410Facet = erc1410Facet.connect(signer_A)
        await expect(
            (
                await erc1410Facet.transferByPartition(
                    _PARTITION_ID_1,
                    account_C,
                    500,
                    '0x'
                )
            ).wait()
        ).to.eventually.be.rejectedWith(Error)

        console.log(
            'Issue 1 security to account “A” using account “I” => fails (paused)'
        )
        erc1410Facet = erc1410Facet.connect(signer_I)
        await expect(
            (
                await erc1410Facet.issueByPartition(
                    _PARTITION_ID_1,
                    account_A,
                    1,
                    '0x'
                )
            ).wait()
        ).to.eventually.be.rejectedWith(Error)

        console.log('Unpause security token using account “P” => succeeds')
        pauseFacet = pauseFacet.connect(signer_P)
        await pauseFacet.unpause()

        console.log(
            'Grant controller role to account “I” using account “Z” => succeeds'
        )
        accessControlFacet = accessControlFacet.connect(signer_Z)
        await accessControlFacet.grantRole(_CONTROLLER_ROLE, account_I)

        console.log(
            'Transfer 500 securities from account “A” to “C” => succeeds'
        )
        erc1410Facet = erc1410Facet.connect(signer_A)
        await erc1410Facet.transferByPartition(
            _PARTITION_ID_1,
            account_C,
            500,
            '0x'
        )

        console.log(
            'Issue 1 security to account “A” using account “I” => succeeds'
        )
        erc1410Facet = erc1410Facet.connect(signer_I)
        await erc1410Facet.issueByPartition(_PARTITION_ID_1, account_A, 1, '0x')

        console.log('Check current balances and total supply')
        totalSupply = await erc1410Facet.totalSupply()
        accountABalance = await erc1410Facet.balanceOf(account_A)
        accountABalanceByPartition = await erc1410Facet.balanceOfByPartition(
            _PARTITION_ID_1,
            account_A
        )
        accountCBalance = await erc1410Facet.balanceOf(account_C)
        accountCBalanceByPartition = await erc1410Facet.balanceOfByPartition(
            _PARTITION_ID_1,
            account_C
        )
        expect(totalSupply).to.be.equal(8901)
        expect(accountABalance).to.be.equal(8001)
        expect(accountCBalance).to.be.equal(900)
        expect(accountABalanceByPartition).to.be.equal(accountABalance)
        expect(accountCBalanceByPartition).to.be.equal(accountCBalance)

        console.log(`
        
        
                --------------------------------
                    DEMO OVER 
                --------------------------------
                
                `)
    })
})
