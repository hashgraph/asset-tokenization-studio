// contracts/test/unitTests/layer_1/externalKycLists/externalKycList.test.ts
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers.js'
import { isinGenerator } from '@thomaschaplin/isin-generator'
import {
    BusinessLogicResolver,
    IFactory,
    ResolverProxy,
    AccessControlFacet__factory,
    ExternalKycListManagement,
    MockedExternalKycList,
    MockedExternalKycList__factory,
    ExternalKycListManagement__factory,
} from '@typechain'
import {
    deployAtsFullInfrastructure,
    DeployAtsFullInfrastructureCommand,
    deployEquityFromFactory,
    GAS_LIMIT,
    KYC_MANAGER_ROLE,
    MAX_UINT256,
    RegulationSubType,
    RegulationType,
} from '@scripts'

describe('ExternalKycList Management Tests', () => {
    let signer_A: SignerWithAddress
    let signer_B: SignerWithAddress
    let account_A: string

    let diamond: ResolverProxy
    let factory: IFactory
    let businessLogicResolver: BusinessLogicResolver
    let externalKycListManagement: ExternalKycListManagement
    let externalKycListMock1: MockedExternalKycList
    let externalKycListMock2: MockedExternalKycList
    let externalKycListMock3: MockedExternalKycList

    before(async () => {
        // mute | mock console.log
        console.log = () => {}
        ;[signer_A, signer_B] = await ethers.getSigners()
        account_A = signer_A.address

        const { ...deployedContracts } = await deployAtsFullInfrastructure(
            await DeployAtsFullInfrastructureCommand.newInstance({
                signer: signer_A,
                useDeployed: false,
                useEnvironment: false,
                timeTravelEnabled: true,
            })
        )

        factory = deployedContracts.factory.contract
        businessLogicResolver = deployedContracts.businessLogicResolver.contract

        // Deploy mock contracts for external kyc list ONCE
        externalKycListMock1 = await new MockedExternalKycList__factory(
            signer_A
        ).deploy()
        await externalKycListMock1.deployed()
        externalKycListMock2 = await new MockedExternalKycList__factory(
            signer_A
        ).deploy()
        await externalKycListMock2.deployed()
        externalKycListMock3 = await new MockedExternalKycList__factory(
            signer_A
        ).deploy()
        await externalKycListMock3.deployed()
    })

    beforeEach(async () => {
        // Deploy a fresh diamond proxy (implicitly initialized)
        diamond = await deployEquityFromFactory({
            adminAccount: account_A,
            isWhiteList: false,
            isControllable: true,
            arePartitionsProtected: false,
            clearingActive: false,
            isMultiPartition: false,
            name: 'TEST_ExternalKycList',
            symbol: 'TEP',
            decimals: 6,
            isin: isinGenerator(),
            votingRight: false,
            informationRight: false,
            liquidationRight: false,
            subscriptionRight: true,
            conversionRight: true,
            redemptionRight: true,
            putRight: false,
            dividendRight: 1,
            currency: '0x345678',
            numberOfShares: MAX_UINT256,
            nominalValue: 100,
            regulationType: RegulationType.REG_S,
            regulationSubType: RegulationSubType.NONE,
            countriesControlListType: true,
            listOfCountries: 'ES,FR,CH',
            info: 'nothing',
            factory: factory,
            businessLogicResolver: businessLogicResolver.address,
        })

        externalKycListManagement = ExternalKycListManagement__factory.connect(
            diamond.address,
            signer_A
        )

        // Connect to AccessControlFacet for granting roles
        const accessControlFacet = AccessControlFacet__factory.connect(
            diamond.address,
            signer_A
        )
        // Grant KYC_MANAGER_ROLE to signer_A
        await accessControlFacet.grantRole(KYC_MANAGER_ROLE, account_A)

        // Add the default kyc lists needed for most tests using addExternalKycList
        try {
            // Ensure mocks are not already present if deployEquityFromFactory adds defaults
            if (
                !(await externalKycListManagement.isExternalKycList(
                    externalKycListMock1.address
                ))
            ) {
                await externalKycListManagement.addExternalKycList(
                    externalKycListMock1.address,
                    { gasLimit: GAS_LIMIT.default }
                )
            }
            if (
                !(await externalKycListManagement.isExternalKycList(
                    externalKycListMock2.address
                ))
            ) {
                await externalKycListManagement.addExternalKycList(
                    externalKycListMock2.address,
                    { gasLimit: GAS_LIMIT.default }
                )
            }
            // Ensure mock3 is not present at start of tests
            if (
                await externalKycListManagement.isExternalKycList(
                    externalKycListMock3.address
                )
            ) {
                await externalKycListManagement.removeExternalKycList(
                    externalKycListMock3.address
                )
            }
        } catch (e: unknown) {
            if (e instanceof Error) {
                console.error(
                    'Error setting up default kyc lists in beforeEach:',
                    e.message
                )
            } else {
                console.error(
                    'Error setting up default kyc lists in beforeEach:',
                    e
                )
            }
            throw e
        }
    })

    describe('Add Tests', () => {
        it('GIVEN an unlisted external kyc list WHEN added THEN it is listed and event is emitted', async () => {
            const newKycList = externalKycListMock3.address
            expect(
                await externalKycListManagement.isExternalKycList(newKycList)
            ).to.be.false
            const initialCount =
                await externalKycListManagement.getExternalKycListsCount()
            await expect(
                externalKycListManagement.addExternalKycList(newKycList, {
                    gasLimit: GAS_LIMIT.default,
                })
            )
                .to.emit(externalKycListManagement, 'AddedToExternalKycLists')
                .withArgs(signer_A.address, newKycList)
            expect(
                await externalKycListManagement.isExternalKycList(newKycList)
            ).to.be.true
            expect(
                await externalKycListManagement.getExternalKycListsCount()
            ).to.equal(initialCount.add(1))
        })

        it('GIVEN a listed external kyc WHEN adding it again THEN it reverts with ListedKycList', async () => {
            expect(
                await externalKycListManagement.isExternalKycList(
                    externalKycListMock1.address
                )
            ).to.be.true
            await expect(
                externalKycListManagement.addExternalKycList(
                    externalKycListMock1.address,
                    { gasLimit: GAS_LIMIT.default }
                )
            ).to.be.revertedWithCustomError(
                externalKycListManagement,
                'ListedKycList'
            )
        })
    })

    describe('Remove Tests', () => {
        it('GIVEN a listed external kyc WHEN removed THEN it is unlisted and event is emitted', async () => {
            const kycListToRemove = externalKycListMock1.address
            expect(
                await externalKycListManagement.isExternalKycList(
                    kycListToRemove
                )
            ).to.be.true
            const initialCount =
                await externalKycListManagement.getExternalKycListsCount()
            await expect(
                externalKycListManagement.removeExternalKycList(
                    kycListToRemove,
                    {
                        gasLimit: GAS_LIMIT.default,
                    }
                )
            )
                .to.emit(
                    externalKycListManagement,
                    'RemovedFromExternalKycLists'
                )
                .withArgs(signer_A.address, kycListToRemove)
            expect(
                await externalKycListManagement.isExternalKycList(
                    kycListToRemove
                )
            ).to.be.false
            expect(
                await externalKycListManagement.getExternalKycListsCount()
            ).to.equal(initialCount.sub(1))
        })

        it('GIVEN an unlisted external kyc WHEN removing THEN it reverts with UnlistedKycList', async () => {
            const randomAddress = ethers.Wallet.createRandom().address
            expect(
                await externalKycListManagement.isExternalKycList(randomAddress)
            ).to.be.false
            await expect(
                externalKycListManagement.removeExternalKycList(randomAddress, {
                    gasLimit: GAS_LIMIT.default,
                })
            ).to.be.revertedWithCustomError(
                externalKycListManagement,
                'UnlistedKycList'
            )
        })
    })

    describe('Update Tests', () => {
        it('GIVEN multiple external kyc WHEN updated THEN their statuses are updated and event is emitted', async () => {
            expect(
                await externalKycListManagement.isExternalKycList(
                    externalKycListMock1.address
                )
            ).to.be.true
            expect(
                await externalKycListManagement.isExternalKycList(
                    externalKycListMock2.address
                )
            ).to.be.true
            expect(
                await externalKycListManagement.isExternalKycList(
                    externalKycListMock3.address
                )
            ).to.be.false
            const initialCount =
                await externalKycListManagement.getExternalKycListsCount()
            expect(initialCount).to.equal(2)

            const kycListsToUpdate = [
                externalKycListMock2.address,
                externalKycListMock3.address,
            ]
            const activesToUpdate = [false, true]

            await expect(
                externalKycListManagement.updateExternalKycLists(
                    kycListsToUpdate,
                    activesToUpdate,
                    {
                        gasLimit: GAS_LIMIT.high,
                    }
                )
            )
                .to.emit(externalKycListManagement, 'ExternalKycListsUpdated')
                .withArgs(signer_A.address, kycListsToUpdate, activesToUpdate)

            expect(
                await externalKycListManagement.isExternalKycList(
                    externalKycListMock1.address
                )
            ).to.be.true
            expect(
                await externalKycListManagement.isExternalKycList(
                    externalKycListMock2.address
                )
            ).to.be.false
            expect(
                await externalKycListManagement.isExternalKycList(
                    externalKycListMock3.address
                )
            ).to.be.true
            expect(
                await externalKycListManagement.getExternalKycListsCount()
            ).to.equal(initialCount.sub(1).add(1))
        })

        it('GIVEN duplicate addresses with conflicting actives (true then false) WHEN updated THEN it reverts with ContradictoryValuesInArray', async () => {
            const duplicateKycList = externalKycListMock3.address
            expect(
                await externalKycListManagement.isExternalKycList(
                    duplicateKycList
                )
            ).to.be.false

            const kycLists = [duplicateKycList, duplicateKycList]
            const actives = [true, false]

            await expect(
                externalKycListManagement.updateExternalKycLists(
                    kycLists,
                    actives,
                    {
                        gasLimit: GAS_LIMIT.high,
                    }
                )
            ).to.be.revertedWithCustomError(
                externalKycListManagement,
                'ContradictoryValuesInArray'
            )
        })

        it('GIVEN duplicate addresses with conflicting actives (false then true) WHEN updated THEN it reverts with ContradictoryValuesInArray', async () => {
            const duplicateKycList = externalKycListMock1.address
            expect(
                await externalKycListManagement.isExternalKycList(
                    duplicateKycList
                )
            ).to.be.true

            const kycLists = [duplicateKycList, duplicateKycList]
            const actives = [false, true]

            await expect(
                externalKycListManagement.updateExternalKycLists(
                    kycLists,
                    actives,
                    {
                        gasLimit: GAS_LIMIT.high,
                    }
                )
            ).to.be.revertedWithCustomError(
                externalKycListManagement,
                'ContradictoryValuesInArray'
            )
        })

        it('GIVEN empty arrays WHEN updating THEN it succeeds and emits event', async () => {
            const initialCount =
                await externalKycListManagement.getExternalKycListsCount()
            const kycLists: string[] = []
            const actives: boolean[] = []
            await expect(
                externalKycListManagement.updateExternalKycLists(
                    kycLists,
                    actives,
                    {
                        gasLimit: GAS_LIMIT.high,
                    }
                )
            )
                .to.emit(externalKycListManagement, 'ExternalKycListsUpdated')
                .withArgs(signer_A.address, kycLists, actives)
            expect(
                await externalKycListManagement.getExternalKycListsCount()
            ).to.equal(initialCount)
        })
    })

    describe('View/Getter Functions', () => {
        it('GIVEN listed and unlisted addresses WHEN isExternalKycList is called THEN it returns the correct status', async () => {
            expect(
                await externalKycListManagement.isExternalKycList(
                    externalKycListMock1.address
                )
            ).to.be.true
            expect(
                await externalKycListManagement.isExternalKycList(
                    externalKycListMock2.address
                )
            ).to.be.true
            const randomAddress = ethers.Wallet.createRandom().address
            expect(
                await externalKycListManagement.isExternalKycList(randomAddress)
            ).to.be.false
            await externalKycListManagement.addExternalKycList(
                externalKycListMock3.address
            )
            expect(
                await externalKycListManagement.isExternalKycList(
                    externalKycListMock3.address
                )
            ).to.be.true
        })

        it('GIVEN granted and revoked addresses WHEN isExternallyGranted is called THEN it returns the correct status', async () => {
            const randomAddress = ethers.Wallet.createRandom().address
            await externalKycListManagement.removeExternalKycList(
                externalKycListMock2.address,
                {
                    gasLimit: GAS_LIMIT.default,
                }
            )
            expect(
                await externalKycListManagement.isExternallyGranted(
                    randomAddress,
                    1
                )
            ).to.be.false

            await externalKycListMock1.grantKyc(randomAddress, {
                gasLimit: GAS_LIMIT.default,
            })

            expect(
                await externalKycListManagement.isExternallyGranted(
                    randomAddress,
                    1
                )
            ).to.be.true

            await externalKycListMock1.revokeKyc(randomAddress, {
                gasLimit: GAS_LIMIT.default,
            })

            expect(
                await externalKycListManagement.isExternallyGranted(
                    randomAddress,
                    1
                )
            ).to.be.false
        })

        it('GIVEN external kyc lists WHEN getExternalKycListsCount is called THEN it returns the current count', async () => {
            const initialCount =
                await externalKycListManagement.getExternalKycListsCount()
            expect(initialCount).to.equal(2)
            await externalKycListManagement.addExternalKycList(
                externalKycListMock3.address
            )
            expect(
                await externalKycListManagement.getExternalKycListsCount()
            ).to.equal(initialCount.add(1))
            await externalKycListManagement.removeExternalKycList(
                externalKycListMock1.address
            )
            expect(
                await externalKycListManagement.getExternalKycListsCount()
            ).to.equal(initialCount)
            await externalKycListManagement.removeExternalKycList(
                externalKycListMock2.address
            )
            await externalKycListManagement.removeExternalKycList(
                externalKycListMock3.address
            )
            expect(
                await externalKycListManagement.getExternalKycListsCount()
            ).to.equal(0)
        })

        it('GIVEN external kyc lists WHEN getExternalKycListsMembers is called THEN it returns paginated members', async () => {
            expect(
                await externalKycListManagement.getExternalKycListsCount()
            ).to.equal(2)
            let membersPage =
                await externalKycListManagement.getExternalKycListsMembers(0, 1)
            expect(membersPage).to.have.lengthOf(1)
            expect([
                externalKycListMock1.address,
                externalKycListMock2.address,
            ]).to.include(membersPage[0])
            membersPage =
                await externalKycListManagement.getExternalKycListsMembers(1, 1)
            expect(membersPage).to.have.lengthOf(1)
            expect([
                externalKycListMock1.address,
                externalKycListMock2.address,
            ]).to.include(membersPage[0])
            expect(membersPage[0]).to.not.equal(
                (
                    await externalKycListManagement.getExternalKycListsMembers(
                        0,
                        1
                    )
                )[0]
            )
            let allMembers =
                await externalKycListManagement.getExternalKycListsMembers(0, 2)
            expect(allMembers).to.have.lengthOf(2)
            expect(allMembers).to.contain(externalKycListMock1.address)
            expect(allMembers).to.contain(externalKycListMock2.address)
            await externalKycListManagement.addExternalKycList(
                externalKycListMock3.address
            )
            allMembers =
                await externalKycListManagement.getExternalKycListsMembers(0, 3)
            expect(allMembers).to.have.lengthOf(3)
            expect(allMembers).to.contain(externalKycListMock1.address)
            expect(allMembers).to.contain(externalKycListMock2.address)
            expect(allMembers).to.contain(externalKycListMock3.address)
            membersPage =
                await externalKycListManagement.getExternalKycListsMembers(1, 2)
            expect(membersPage).to.have.lengthOf(1)
            membersPage =
                await externalKycListManagement.getExternalKycListsMembers(3, 1)
            expect(membersPage).to.have.lengthOf(0)
            await externalKycListManagement.removeExternalKycList(
                externalKycListMock1.address
            )
            await externalKycListManagement.removeExternalKycList(
                externalKycListMock2.address
            )
            await externalKycListManagement.removeExternalKycList(
                externalKycListMock3.address
            )
            allMembers =
                await externalKycListManagement.getExternalKycListsMembers(0, 5)
            expect(allMembers).to.have.lengthOf(0)
        })
    })

    describe('Access Control Tests', () => {
        it('GIVEN an account without KYC_MANAGER_ROLE WHEN adding an external kyc list THEN it reverts with AccessControl', async () => {
            const newKycList = externalKycListMock3.address
            await expect(
                externalKycListManagement
                    .connect(signer_B)
                    .addExternalKycList(newKycList, {
                        gasLimit: GAS_LIMIT.default,
                    })
            ).to.be.rejectedWith('AccountHasNoRole')
        })

        it('GIVEN an account with KYC_MANAGER_ROLE WHEN adding an external kyc list THEN it succeeds', async () => {
            const newKycList = externalKycListMock3.address
            expect(
                await externalKycListManagement.isExternalKycList(newKycList)
            ).to.be.false
            await expect(
                externalKycListManagement.addExternalKycList(newKycList, {
                    gasLimit: GAS_LIMIT.default,
                })
            )
                .to.emit(externalKycListManagement, 'AddedToExternalKycLists')
                .withArgs(account_A, newKycList)
            expect(
                await externalKycListManagement.isExternalKycList(newKycList)
            ).to.be.true
        })

        it('GIVEN an account without KYC_MANAGER_ROLE WHEN removing an external kyc list THEN it reverts with AccessControl', async () => {
            expect(
                await externalKycListManagement.isExternalKycList(
                    externalKycListMock1.address
                )
            ).to.be.true
            await expect(
                externalKycListManagement
                    .connect(signer_B)
                    .removeExternalKycList(externalKycListMock1.address, {
                        gasLimit: GAS_LIMIT.default,
                    })
            ).to.be.rejectedWith('AccountHasNoRole')
        })

        it('GIVEN an account with KYC_MANAGER_ROLE WHEN removing an external kyc list THEN it succeeds', async () => {
            expect(
                await externalKycListManagement.isExternalKycList(
                    externalKycListMock1.address
                )
            ).to.be.true
            await expect(
                externalKycListManagement.removeExternalKycList(
                    externalKycListMock1.address,
                    { gasLimit: GAS_LIMIT.default }
                )
            )
                .to.emit(
                    externalKycListManagement,
                    'RemovedFromExternalKycLists'
                )
                .withArgs(account_A, externalKycListMock1.address)
            expect(
                await externalKycListManagement.isExternalKycList(
                    externalKycListMock1.address
                )
            ).to.be.false
        })

        it('GIVEN an account without KYC_MANAGER_ROLE WHEN updating external kyc lists THEN it reverts with AccessControl', async () => {
            const kycLists = [externalKycListMock1.address]
            const actives = [false]
            expect(
                await externalKycListManagement.isExternalKycList(
                    externalKycListMock1.address
                )
            ).to.be.true
            await expect(
                externalKycListManagement
                    .connect(signer_B)
                    .updateExternalKycLists(kycLists, actives, {
                        gasLimit: GAS_LIMIT.high,
                    })
            ).to.be.rejectedWith('AccountHasNoRole')
        })

        it('GIVEN an account with KYC_MANAGER_ROLE WHEN updating external kyc lists THEN it succeeds', async () => {
            expect(
                await externalKycListManagement.isExternalKycList(
                    externalKycListMock1.address
                )
            ).to.be.true
            expect(
                await externalKycListManagement.isExternalKycList(
                    externalKycListMock2.address
                )
            ).to.be.true
            const kycLists = [
                externalKycListMock1.address,
                externalKycListMock2.address,
            ]
            const actives = [false, true]
            await expect(
                externalKycListManagement.updateExternalKycLists(
                    kycLists,
                    actives,
                    {
                        gasLimit: GAS_LIMIT.high,
                    }
                )
            )
                .to.emit(externalKycListManagement, 'ExternalKycListsUpdated')
                .withArgs(account_A, kycLists, actives)
            expect(
                await externalKycListManagement.isExternalKycList(
                    externalKycListMock1.address
                )
            ).to.be.false
            expect(
                await externalKycListManagement.isExternalKycList(
                    externalKycListMock2.address
                )
            ).to.be.true
        })
    })
})
