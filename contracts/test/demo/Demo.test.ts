import { expect } from 'chai'
import { ethers } from 'hardhat'
import {
    type Diamond,
    type DiamondLoupeFacet,
    type AccessControl,
    type Pause,
    type ControlList,
    type ERC20,
    type ERC1410ScheduledSnapshot,
    type Equity,
    type Snapshots,
    type ScheduledSnapshots,
    type Cap,
} from '../../typechain-types'
import {
    deployEnvironment,
    environment,
} from '../../scripts/deployEnvironmentByRpc'
import {
    _DEFAULT_ADMIN_ROLE,
    _CONTROL_LIST_ROLE,
    _CORPORATE_ACTION_ROLE,
    _ISSUER_ROLE,
    _CONTROLLER_ROLE,
    _PAUSER_ROLE,
    ADDRESS_0,
} from '../../scripts/constants'
import {
    DividendType,
    RegulationSubType,
    RegulationType,
    deployEquityFromFactory,
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

describe('Demo RedSwam', () => {
    let diamond: Diamond

    it('Demo RedSwam', async () => {
        const [signer_Z, signer_A, signer_B, signer_C, signer_I, signer_P] =
            await ethers.getSigners()
        const account_Z = signer_Z.address
        const account_A = signer_A.address
        const account_B = signer_B.address
        const account_C = signer_C.address
        const account_I = signer_I.address
        const account_P = signer_P.address

        console.log('Account Z : ' + account_Z)
        console.log('Account A : ' + account_A)
        console.log('Account B : ' + account_B)
        console.log('Account C : ' + account_C)
        console.log('Account I : ' + account_I)
        console.log('Account P : ' + account_P)

        await deployEnvironment()

        console.log(`
Deployed contracts:
    BusinessLogicResolver: ${environment.resolver.address},
    Factory: ${environment.factory.address},
    DiamondFacet: 
        address: ${environment.deployedBusinessLogics.diamondFacet.address},
        key: ${await environment.deployedBusinessLogics.diamondFacet.getStaticResolverKey()},
        selectors: ${JSON.stringify(
            await environment.deployedBusinessLogics.diamondFacet.getStaticFunctionSelectors()
        )},
    AccessControl: 
        address: ${environment.deployedBusinessLogics.accessControl.address},
        key: ${await environment.deployedBusinessLogics.accessControl.getStaticResolverKey()},
        selectors: ${JSON.stringify(
            await environment.deployedBusinessLogics.accessControl.getStaticFunctionSelectors()
        )},
    Pause: 
        address: ${environment.deployedBusinessLogics.pause.address},
        key: ${await environment.deployedBusinessLogics.pause.getStaticResolverKey()},
        selectors: ${JSON.stringify(
            await environment.deployedBusinessLogics.pause.getStaticFunctionSelectors()
        )},
    ControlList: 
        address: ${environment.deployedBusinessLogics.controlList.address},
        key: ${await environment.deployedBusinessLogics.controlList.getStaticResolverKey()},
        selectors: ${JSON.stringify(
            await environment.deployedBusinessLogics.controlList.getStaticFunctionSelectors()
        )},
    CorporateActions: 
        address: ${
            environment.deployedBusinessLogics.corporateActionsSecurity.address
        },
        key: ${await environment.deployedBusinessLogics.corporateActionsSecurity.getStaticResolverKey()},
        selectors: ${JSON.stringify(
            await environment.deployedBusinessLogics.corporateActionsSecurity.getStaticFunctionSelectors()
        )},
    ERC20: 
        address: ${environment.deployedBusinessLogics.eRC20.address},
        key: ${await environment.deployedBusinessLogics.eRC20.getStaticResolverKey()},
        selectors: ${JSON.stringify(
            await environment.deployedBusinessLogics.eRC20.getStaticFunctionSelectors()
        )},
    ERC1644: 
        address: ${environment.deployedBusinessLogics.eRC1644.address},
        key: ${await environment.deployedBusinessLogics.eRC1644.getStaticResolverKey()},
        selectors: ${JSON.stringify(
            await environment.deployedBusinessLogics.eRC1644.getStaticFunctionSelectors()
        )},
    ERC1410: 
        address: ${
            environment.deployedBusinessLogics.eRC1410ScheduledSnapshot.address
        },
        key: ${await environment.deployedBusinessLogics.eRC1410ScheduledSnapshot.getStaticResolverKey()},
        selectors: ${JSON.stringify(
            await environment.deployedBusinessLogics.eRC1410ScheduledSnapshot.getStaticFunctionSelectors()
        )},
    ERC1594: 
        address: ${environment.deployedBusinessLogics.eRC1594.address},
        key: ${await environment.deployedBusinessLogics.eRC1594.getStaticResolverKey()},
        selectors: ${JSON.stringify(
            await environment.deployedBusinessLogics.eRC1594.getStaticFunctionSelectors()
        )},
    ERC1643: 
        address: ${environment.deployedBusinessLogics.eRC1643.address},
        key: ${await environment.deployedBusinessLogics.eRC1643.getStaticResolverKey()},
        selectors: ${JSON.stringify(
            await environment.deployedBusinessLogics.eRC1643.getStaticFunctionSelectors()
        )},
    Equity: 
        address: ${environment.deployedBusinessLogics.equityUSA.address},
        key: ${await environment.deployedBusinessLogics.equityUSA.getStaticResolverKey()},
        selectors: ${JSON.stringify(
            await environment.deployedBusinessLogics.equityUSA.getStaticFunctionSelectors()
        )},
    Snapshots: 
        address: ${environment.deployedBusinessLogics.snapshots.address},
        key: ${await environment.deployedBusinessLogics.snapshots.getStaticResolverKey()},
        selectors: ${JSON.stringify(
            await environment.deployedBusinessLogics.snapshots.getStaticFunctionSelectors()
        )},
    Lock: 
        address: ${environment.deployedBusinessLogics.lock.address},
        key: ${await environment.deployedBusinessLogics.lock.getStaticResolverKey()},
        selectors: ${JSON.stringify(
            await environment.deployedBusinessLogics.lock.getStaticFunctionSelectors()
        )},
    TransferAndLock: 
        address: ${environment.deployedBusinessLogics.transferAndLock.address},
        key: ${await environment.deployedBusinessLogics.transferAndLock.getStaticResolverKey()},
        selectors: ${JSON.stringify(
            await environment.deployedBusinessLogics.transferAndLock.getStaticFunctionSelectors()
        )},
    ScheduledSnapshots: 
        address: ${
            environment.deployedBusinessLogics.scheduledSnapshots.address
        },
        key: ${await environment.deployedBusinessLogics.scheduledSnapshots.getStaticResolverKey()},
        selectors: ${JSON.stringify(
            await environment.deployedBusinessLogics.scheduledSnapshots.getStaticFunctionSelectors()
        )},
        
        `)

        expect(await environment.resolver.getVersionStatus(1)).to.be.equal(
            VersionStatus.ACTIVATED
        )

        expect(await environment.resolver.getLatestVersion()).to.be.equal(1)
        expect(
            await environment.resolver.resolveLatestBusinessLogic(
                await environment.deployedBusinessLogics.diamondFacet.getStaticResolverKey()
            )
        ).to.be.equal(environment.deployedBusinessLogics.diamondFacet.address)
        expect(
            await environment.resolver.resolveLatestBusinessLogic(
                await environment.deployedBusinessLogics.accessControl.getStaticResolverKey()
            )
        ).to.be.equal(environment.deployedBusinessLogics.accessControl.address)
        expect(
            await environment.resolver.resolveLatestBusinessLogic(
                await environment.deployedBusinessLogics.pause.getStaticResolverKey()
            )
        ).to.be.equal(environment.deployedBusinessLogics.pause.address)
        expect(
            await environment.resolver.resolveLatestBusinessLogic(
                await environment.deployedBusinessLogics.controlList.getStaticResolverKey()
            )
        ).to.be.equal(environment.deployedBusinessLogics.controlList.address)
        expect(
            await environment.resolver.resolveLatestBusinessLogic(
                await environment.deployedBusinessLogics.corporateActionsSecurity.getStaticResolverKey()
            )
        ).to.be.equal(
            environment.deployedBusinessLogics.corporateActionsSecurity.address
        )
        expect(
            await environment.resolver.resolveLatestBusinessLogic(
                await environment.deployedBusinessLogics.eRC20.getStaticResolverKey()
            )
        ).to.be.equal(environment.deployedBusinessLogics.eRC20.address)
        expect(
            await environment.resolver.resolveLatestBusinessLogic(
                await environment.deployedBusinessLogics.eRC1644.getStaticResolverKey()
            )
        ).to.be.equal(environment.deployedBusinessLogics.eRC1644.address)
        expect(
            await environment.resolver.resolveLatestBusinessLogic(
                await environment.deployedBusinessLogics.eRC1410ScheduledSnapshot.getStaticResolverKey()
            )
        ).to.be.equal(
            environment.deployedBusinessLogics.eRC1410ScheduledSnapshot.address
        )
        expect(
            await environment.resolver.resolveLatestBusinessLogic(
                await environment.deployedBusinessLogics.eRC1594.getStaticResolverKey()
            )
        ).to.be.equal(environment.deployedBusinessLogics.eRC1594.address)
        expect(
            await environment.resolver.resolveLatestBusinessLogic(
                await environment.deployedBusinessLogics.eRC1643.getStaticResolverKey()
            )
        ).to.be.equal(await environment.deployedBusinessLogics.eRC1643.address)
        expect(
            await environment.resolver.resolveLatestBusinessLogic(
                await environment.deployedBusinessLogics.equityUSA.getStaticResolverKey()
            )
        ).to.be.equal(
            await environment.deployedBusinessLogics.equityUSA.address
        )
        expect(
            await environment.resolver.resolveLatestBusinessLogic(
                await environment.deployedBusinessLogics.snapshots.getStaticResolverKey()
            )
        ).to.be.equal(
            await environment.deployedBusinessLogics.snapshots.address
        )
        expect(
            await environment.resolver.resolveLatestBusinessLogic(
                await environment.deployedBusinessLogics.lock.getStaticResolverKey()
            )
        ).to.be.equal(await environment.deployedBusinessLogics.lock.address)
        expect(
            await environment.resolver.resolveLatestBusinessLogic(
                await environment.deployedBusinessLogics.transferAndLock.getStaticResolverKey()
            )
        ).to.be.equal(
            await environment.deployedBusinessLogics.transferAndLock.address
        )
        expect(
            await environment.resolver.resolveLatestBusinessLogic(
                await environment.deployedBusinessLogics.scheduledSnapshots.getStaticResolverKey()
            )
        ).to.be.equal(
            await environment.deployedBusinessLogics.scheduledSnapshots.address
        )
        expect(
            await environment.resolver.resolveBusinessLogicByVersion(
                await environment.deployedBusinessLogics.diamondFacet.getStaticResolverKey(),
                1
            )
        ).to.be.equal(environment.deployedBusinessLogics.diamondFacet.address)
        expect(await environment.resolver.getBusinessLogicCount()).to.be.equal(
            _BUSINESS_LOGIC_COUNT
        )
        const businessLogicKeys = JSON.parse(
            JSON.stringify(
                await environment.resolver.getBusinessLogicKeys(0, 30)
            )
        ).sort()
        expect(businessLogicKeys).to.be.deep.equal(
            [
                await environment.deployedBusinessLogics.diamondFacet.getStaticResolverKey(),
                await environment.deployedBusinessLogics.accessControl.getStaticResolverKey(),
                await environment.deployedBusinessLogics.pause.getStaticResolverKey(),
                await environment.deployedBusinessLogics.controlList.getStaticResolverKey(),
                await environment.deployedBusinessLogics.corporateActionsSecurity.getStaticResolverKey(),
                await environment.deployedBusinessLogics.eRC20.getStaticResolverKey(),
                await environment.deployedBusinessLogics.eRC1644.getStaticResolverKey(),
                await environment.deployedBusinessLogics.eRC1410ScheduledSnapshot.getStaticResolverKey(),
                await environment.deployedBusinessLogics.eRC1594.getStaticResolverKey(),
                await environment.deployedBusinessLogics.eRC1643.getStaticResolverKey(),
                await environment.deployedBusinessLogics.equityUSA.getStaticResolverKey(),
                await environment.deployedBusinessLogics.bondUSA.getStaticResolverKey(),
                await environment.deployedBusinessLogics.snapshots.getStaticResolverKey(),
                await environment.deployedBusinessLogics.scheduledSnapshots.getStaticResolverKey(),
                await environment.deployedBusinessLogics.cap.getStaticResolverKey(),
                await environment.deployedBusinessLogics.lock.getStaticResolverKey(),
                await environment.deployedBusinessLogics.transferAndLock.getStaticResolverKey(),
            ].sort()
        )
        console.log(
            `Business Logic Keys : ${JSON.stringify(businessLogicKeys)}`
        )
        //await loadFixture(deployDiamond(signerAddress))
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
        const numberOfShares = 200000
        const nominalValue = 100

        diamond = await deployEquityFromFactory(
            account_Z,
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
            nominalValue,
            RegulationType.REG_S,
            RegulationSubType.NONE,
            true,
            'ES,FR,CH',
            'nothing'
        )
        console.log(`    Diamond: ${diamond.address}`)

        const loupeFacet: DiamondLoupeFacet = await ethers.getContractAt(
            'DiamondLoupeFacet',
            diamond.address
        )

        console.log(`
DiamondResume:
    DiamondLoupe.facets: ${JSON.stringify(await loupeFacet.getFacets())}
    DiamondLoupe.facetFunctionSelectors[diamondFacet]: ${JSON.stringify(
        await loupeFacet.getFacetFunctionSelectors(
            await environment.deployedBusinessLogics.diamondFacet.getStaticResolverKey()
        )
    )}
    DiamondLoupe.facetFunctionSelectors[accessControl]: ${JSON.stringify(
        await loupeFacet.getFacetFunctionSelectors(
            await environment.deployedBusinessLogics.accessControl.getStaticResolverKey()
        )
    )}
    DiamondLoupe.facetFunctionSelectors[pause]: ${JSON.stringify(
        await loupeFacet.getFacetFunctionSelectors(
            await environment.deployedBusinessLogics.pause.getStaticResolverKey()
        )
    )}
    DiamondLoupe.facetFunctionSelectors[controlList]: ${JSON.stringify(
        await loupeFacet.getFacetFunctionSelectors(
            await environment.deployedBusinessLogics.controlList.getStaticResolverKey()
        )
    )}
    DiamondLoupe.facetFunctionSelectors[corporateActions]: ${JSON.stringify(
        await loupeFacet.getFacetFunctionSelectors(
            await environment.deployedBusinessLogics.corporateActionsSecurity.getStaticResolverKey()
        )
    )}
    DiamondLoupe.facetFunctionSelectors[erc20]: ${JSON.stringify(
        await loupeFacet.getFacetFunctionSelectors(
            await environment.deployedBusinessLogics.eRC20.getStaticResolverKey()
        )
    )}
    DiamondLoupe.facetFunctionSelectors[erc1644]: ${JSON.stringify(
        await loupeFacet.getFacetFunctionSelectors(
            await environment.deployedBusinessLogics.eRC1644.getStaticResolverKey()
        )
    )}
    DiamondLoupe.facetFunctionSelectors[erc1410]: ${JSON.stringify(
        await loupeFacet.getFacetFunctionSelectors(
            await environment.deployedBusinessLogics.eRC1410ScheduledSnapshot.getStaticResolverKey()
        )
    )}
    DiamondLoupe.facetFunctionSelectors[erc1594]: ${JSON.stringify(
        await loupeFacet.getFacetFunctionSelectors(
            await environment.deployedBusinessLogics.eRC1594.getStaticResolverKey()
        )
    )}
    DiamondLoupe.facetFunctionSelectors[erc1643]: ${JSON.stringify(
        await loupeFacet.getFacetFunctionSelectors(
            await environment.deployedBusinessLogics.eRC1643.getStaticResolverKey()
        )
    )}
    DiamondLoupe.facetFunctionSelectors[equity]: ${JSON.stringify(
        await loupeFacet.getFacetFunctionSelectors(
            await environment.deployedBusinessLogics.equityUSA.getStaticResolverKey()
        )
    )}
    DiamondLoupe.facetFunctionSelectors[bond]: ${JSON.stringify(
        await loupeFacet.getFacetFunctionSelectors(
            await environment.deployedBusinessLogics.bondUSA.getStaticResolverKey()
        )
    )}
    DiamondLoupe.facetFunctionSelectors[snapshots]: ${JSON.stringify(
        await loupeFacet.getFacetFunctionSelectors(
            await environment.deployedBusinessLogics.snapshots.getStaticResolverKey()
        )
    )}
    DiamondLoupe.facetFunctionSelectors[lock]: ${JSON.stringify(
        await loupeFacet.getFacetFunctionSelectors(
            await environment.deployedBusinessLogics.lock.getStaticResolverKey()
        )
    )}
    DiamondLoupe.facetFunctionSelectors[transferAndLock]: ${JSON.stringify(
        await loupeFacet.getFacetFunctionSelectors(
            await environment.deployedBusinessLogics.transferAndLock.getStaticResolverKey()
        )
    )}
    DiamondLoupe.facetFunctionSelectors[scheduledSnapshots]: ${JSON.stringify(
        await loupeFacet.getFacetFunctionSelectors(
            await environment.deployedBusinessLogics.scheduledSnapshots.getStaticResolverKey()
        )
    )}
    DiamondLoupe.facetFunctionSelectors[cap]: ${JSON.stringify(
        await loupeFacet.getFacetFunctionSelectors(
            await environment.deployedBusinessLogics.cap.getStaticResolverKey()
        )
    )}
    DiamondLoupe.facetKeys: ${JSON.stringify(await loupeFacet.getFacetKeys())}
    DiamondLoupe.facetAddresses: ${JSON.stringify(
        await loupeFacet.getFacetAddresses()
    )}
    DiamondLoupe.facetKey(0xb8fb063e): ${await loupeFacet.getFacetKeyBySelector(
        '0xb8fb063e'
    )}
    DiamondLoupe.facet(0xb8fb063e): ${await loupeFacet.getFacet(
        await environment.deployedBusinessLogics.diamondFacet.getStaticResolverKey()
    )}
    DiamondLoupe.facetAddress(0xb8fb063e): ${await loupeFacet.getFacetAddress(
        '0xb8fb063e'
    )}
    DiamondLoupe.supportsInterface(0xb8fb063e): ${JSON.stringify(
        await loupeFacet.supportsInterface('0xb8fb063e')
    )}`)

        let accessControlFacet: AccessControl = await ethers.getContractAt(
            'AccessControl',
            diamond.address
        )

        const capFacet: Cap = await ethers.getContractAt(
            'Cap',
            await diamond.address
        )

        let pauseFacet: Pause = await ethers.getContractAt(
            'Pause',
            diamond.address
        )

        let controlListFacet: ControlList = await ethers.getContractAt(
            'ControlList',
            diamond.address
        )

        const erc20Facet: ERC20 = await ethers.getContractAt(
            'ERC20',
            await diamond.address
        )

        let erc1410Facet: ERC1410ScheduledSnapshot = await ethers.getContractAt(
            'ERC1410ScheduledSnapshot',
            await diamond.address
        )

        let equityFacet: Equity = await ethers.getContractAt(
            'Equity',
            await diamond.address
        )

        const snapshotsFacet: Snapshots = await ethers.getContractAt(
            'Snapshots',
            diamond.address
        )

        const scheduledSnapshotsFacet: ScheduledSnapshots =
            await ethers.getContractAt('ScheduledSnapshots', diamond.address)

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

        console.log('Check multi partition')
        const multiPartition = await erc1410Facet.isMultiPartition()
        expect(multiPartition).to.equal(isMultiPartition)

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
        expect(equityMetadata.currency).to.equal(currency)
        expect(equityMetadata.nominalValue).to.equal(nominalValue)

        console.log('Check max Supply')
        const maxSupply = await capFacet.getMaxSupply()
        expect(maxSupply).to.equal(numberOfShares)

        console.log(
            'Add account "B" to blakclist using account "I" => fails (no permission)'
        )
        controlListFacet = controlListFacet.connect(signer_I)
        await expect(
            controlListFacet.addToControlList(account_B)
        ).to.be.rejectedWith('AccountHasNoRole')

        console.log(
            'Grant issuer, control list, corporate action and controller roles to account "I" using account "Z" => succeeds'
        )
        accessControlFacet = accessControlFacet.connect(signer_Z)
        await expect(accessControlFacet.grantRole(_ISSUER_ROLE, account_I))
            .to.emit(accessControlFacet, 'RoleGranted')
            .withArgs(account_Z, account_I, _ISSUER_ROLE)
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
        expect(adminMembers[0]).to.be.equal(account_Z)
        expect(issuerMembers.length).to.be.equal(issuerMemberCount)
        expect(issuerMembers[0]).to.be.equal(account_I)
        expect(controlListMembers.length).to.be.equal(controlListMemberCount)
        expect(controlListMembers[0]).to.be.equal(account_I)
        expect(corporateActionsMembers.length).to.be.equal(
            corporateActionsMemberCount
        )
        expect(corporateActionsMembers[0]).to.be.equal(account_I)
        expect(controllerMembers.length).to.be.equal(controllerMemberCount)
        expect(controllerMembers[0]).to.be.equal(account_I)
        expect(pauserMembers.length).to.be.equal(pauserMemberCount)
        expect(pauserMembers[0]).to.be.equal(account_P)

        console.log(
            'Add account "B" to blacklist using account "I" => succeeds'
        )
        controlListFacet = controlListFacet.connect(signer_I)
        await expect(controlListFacet.addToControlList(account_B))
            .to.emit(controlListFacet, 'AddedToControlList')
            .withArgs(account_I, account_B)

        console.log(
            'Issue 10.000 securities to account "B" using account "I" => fails (B is blacklisted)'
        )
        erc1410Facet = erc1410Facet.connect(signer_I)
        await expect(
            erc1410Facet.issueByPartition(
                _PARTITION_ID_1,
                account_B,
                10000,
                '0x'
            )
        ).to.be.rejectedWith('AccountIsBlocked')

        console.log(
            'Issue 10.000 securities to account "A" using account "I" => succeeds'
        )
        erc1410Facet = erc1410Facet.connect(signer_I)
        await expect(
            erc1410Facet.issueByPartition(
                _PARTITION_ID_1,
                account_A,
                10000,
                '0x'
            )
        ).to.emit(erc1410Facet, 'IssuedByPartition')
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
            erc1410Facet.transferByPartition(
                _PARTITION_ID_1,
                account_B,
                500,
                '0x'
            )
        ).to.be.rejectedWith('AccountIsBlocked')

        console.log(
            'Transfer 500 securities from account "A" to "C" => succeeds'
        )
        erc1410Facet = erc1410Facet.connect(signer_A)
        await expect(
            erc1410Facet.transferByPartition(
                _PARTITION_ID_1,
                account_C,
                500,
                '0x'
            )
        )
            .to.emit(erc1410Facet, 'TransferByPartition')
            .withArgs(
                _PARTITION_ID_1,
                ADDRESS_0,
                account_A,
                account_C,
                500,
                '0x',
                '0x'
            )

        console.log(
            'Schedule dividends for 1 minute later (1 unit per security) using account "I" => succeeds'
        )
        equityFacet = equityFacet.connect(signer_I)
        const currentTimeInSeconds = (await ethers.provider.getBlock('latest'))
            .timestamp
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
        const scheduledSnapshots =
            await scheduledSnapshotsFacet.getScheduledSnapshots(0, 1000)
        expect(scheduledSnapshotsCount.toNumber()).to.be.equal(1)
        expect(scheduledSnapshots.length).to.be.equal(1)
        expect(scheduledSnapshots[0].scheduledTimestamp.toNumber()).to.be.equal(
            dividendsRecordDateInSeconds
        )
        expect(scheduledSnapshots[0].data).to.be.equal(
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
            erc1410Facet.transferByPartition(
                _PARTITION_ID_1,
                account_A,
                1,
                '0x'
            )
        ).to.be.rejectedWith('AccountIsBlocked')

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
            erc1410Facet.controllerTransferByPartition(
                _PARTITION_ID_1,
                account_A,
                account_C,
                500,
                '0x',
                '0x'
            )
        ).to.be.rejectedWith('AccountHasNoRole')

        console.log(
            'Force redeem 100 securities from account "C" using account "I" => fails (no permission)'
        )
        erc1410Facet = erc1410Facet.connect(signer_I)
        await expect(
            erc1410Facet.controllerRedeemByPartition(
                _PARTITION_ID_1,
                account_C,
                100,
                '0x',
                '0x'
            )
        ).to.be.rejectedWith('AccountHasNoRole')

        console.log('Pause security token using account "P" => succeeds')
        pauseFacet = pauseFacet.connect(signer_P)
        await pauseFacet.pause()

        console.log(
            'Grant controller role to  account “I” using account “Z” => fails (paused)'
        )
        accessControlFacet = accessControlFacet.connect(signer_Z)
        await expect(
            accessControlFacet.grantRole(_CONTROLLER_ROLE, account_I)
        ).to.be.rejectedWith('TokenIsPaused')

        console.log(
            'Transfer 500 securities from account “A” to “C” => fails (paused)'
        )
        erc1410Facet = erc1410Facet.connect(signer_A)
        await expect(
            erc1410Facet.transferByPartition(
                _PARTITION_ID_1,
                account_C,
                500,
                '0x'
            )
        ).to.be.rejectedWith('TokenIsPaused')

        console.log(
            'Issue 1 security to account “A” using account “I” => fails (paused)'
        )
        erc1410Facet = erc1410Facet.connect(signer_I)
        await expect(
            erc1410Facet.issueByPartition(_PARTITION_ID_1, account_A, 1, '0x')
        ).to.be.rejectedWith('TokenIsPaused')

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
