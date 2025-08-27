import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers.js'
import { isinGenerator } from '@thomaschaplin/isin-generator'
import {
    BusinessLogicResolver,
    Beneficiaries,
    Beneficiaries__factory,
    IFactory,
    ResolverProxy,
    AccessControl,
    AccessControlFacet__factory,
    Pause,
    PauseFacet__factory,
} from '@typechain'
import {
    deployAtsFullInfrastructure,
    DeployAtsFullInfrastructureCommand,
    deployBondFromFactory,
    GAS_LIMIT,
    BENEFICIARY_MANAGER_ROLE,
    RegulationSubType,
    RegulationType,
    PAUSER_ROLE,
} from '@scripts'

const BENEFICIARY_1 = '0x1234567890123456789012345678901234567890'
const BENEFICIARY_1_DATA = '0xabcdef'
const BENEFICIARY_2 = '0x2345678901234567890123456789012345678901'
const BENEFICIARY_2_DATA = '0x88888888'
const numberOfUnits = 1000
let startingDate = 999999999999990
const couponFrequency = 0
const couponRate = 0
let maturityDate = 999999999999999
let firstCouponDate = 0
const countriesControlListType = true
const listOfCountries = 'ES,FR,CH'
const info = 'info'

describe('Beneficiaries Tests', () => {
    let signer_A: SignerWithAddress
    let signer_B: SignerWithAddress
    let account_A: string

    let diamond: ResolverProxy
    let factory: IFactory
    let businessLogicResolver: BusinessLogicResolver
    let beneficiariesFacet: Beneficiaries
    let accessControlFacet: AccessControl
    let pauseFacet: Pause

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
    })

    beforeEach(async () => {
        // Deploy a fresh diamond proxy (implicitly initialized)
        diamond = await deployBondFromFactory({
            adminAccount: account_A,
            isWhiteList: false,
            isControllable: true,
            arePartitionsProtected: false,
            clearingActive: false,
            internalKycActivated: false,
            isMultiPartition: false,
            name: 'TEST_Beneficiaries',
            symbol: 'TB',
            decimals: 6,
            isin: isinGenerator(),
            currency: '0x455552',
            numberOfUnits,
            nominalValue: 100,
            startingDate,
            maturityDate,
            couponFrequency,
            couponRate,
            firstCouponDate,
            regulationType: RegulationType.REG_D,
            regulationSubType: RegulationSubType.REG_D_506_C,
            countriesControlListType,
            listOfCountries,
            info,
            factory,
            businessLogicResolver: businessLogicResolver.address,
            beneficiariesList: [BENEFICIARY_2],
            beneficiariesListData: [BENEFICIARY_2_DATA],
        })

        beneficiariesFacet = Beneficiaries__factory.connect(
            diamond.address,
            signer_A
        )

        accessControlFacet = AccessControlFacet__factory.connect(
            diamond.address,
            signer_A
        )

        pauseFacet = PauseFacet__factory.connect(diamond.address, signer_A)

        await accessControlFacet.grantRole(BENEFICIARY_MANAGER_ROLE, account_A)

        await accessControlFacet.grantRole(PAUSER_ROLE, account_A)
    })

    describe('Initialization Tests', () => {
        it('GIVEN a token WHEN initializing the beneficiary  again THEN it reverts with AlreadyInitialized', async () => {
            await expect(
                beneficiariesFacet.initialize_Beneficiaries(
                    [BENEFICIARY_1],
                    [BENEFICIARY_1_DATA],
                    { gasLimit: GAS_LIMIT.default }
                )
            ).to.be.revertedWithCustomError(
                beneficiariesFacet,
                'AlreadyInitialized'
            )
        })
    })

    describe('Add Tests', () => {
        it('GIVEN an unlisted beneficiary WHEN unauthorized user adds it THEN it reverts with AccountHasNoRole', async () => {
            beneficiariesFacet = beneficiariesFacet.connect(signer_B)

            await expect(
                beneficiariesFacet.addBeneficiary(
                    BENEFICIARY_1,
                    BENEFICIARY_1_DATA,
                    { gasLimit: GAS_LIMIT.default }
                )
            ).to.be.revertedWithCustomError(
                beneficiariesFacet,
                'AccountHasNoRole'
            )
        })

        it('GIVEN an unlisted beneficiary WHEN user adds if token is paused THEN it reverts with TokenIsPaused', async () => {
            await pauseFacet.pause({ gasLimit: GAS_LIMIT.default })

            await expect(
                beneficiariesFacet.addBeneficiary(
                    BENEFICIARY_1,
                    BENEFICIARY_1_DATA,
                    { gasLimit: GAS_LIMIT.default }
                )
            ).to.be.revertedWithCustomError(beneficiariesFacet, 'TokenIsPaused')
        })

        it('GIVEN a listed beneficiary WHEN adding it again THEN it reverts with BeneficiaryAlreadyExists', async () => {
            await expect(
                beneficiariesFacet.addBeneficiary(
                    BENEFICIARY_2,
                    BENEFICIARY_1_DATA,
                    { gasLimit: GAS_LIMIT.default }
                )
            ).to.be.revertedWithCustomError(
                beneficiariesFacet,
                'BeneficiaryAlreadyExists'
            )
        })

        it('GIVEN a unlisted beneficiary WHEN authorized user adds it THEN it is listed and event is emitted', async () => {
            await expect(
                beneficiariesFacet.addBeneficiary(
                    BENEFICIARY_1,
                    BENEFICIARY_1_DATA,
                    { gasLimit: GAS_LIMIT.default }
                )
            )
                .to.emit(beneficiariesFacet, 'BeneficiaryAdded')
                .withArgs(signer_A.address, BENEFICIARY_1, BENEFICIARY_1_DATA)

            expect(await beneficiariesFacet.isBeneficiary(BENEFICIARY_1)).to.be
                .true

            expect(
                await beneficiariesFacet.getBeneficiaryData(BENEFICIARY_1)
            ).to.equal(BENEFICIARY_1_DATA)

            expect(await beneficiariesFacet.getBeneficiariesCount()).to.equal(2)

            expect(
                await beneficiariesFacet.getBeneficiaries(0, 100)
            ).to.have.same.members([BENEFICIARY_2, BENEFICIARY_1])
        })
    })

    describe('Remove Tests', () => {
        it('GIVEN a listed beneficiary WHEN unauthorized user removes it THEN it reverts with AccountHasNoRole', async () => {
            beneficiariesFacet = beneficiariesFacet.connect(signer_B)

            await expect(
                beneficiariesFacet.removeBeneficiary(BENEFICIARY_2, {
                    gasLimit: GAS_LIMIT.default,
                })
            ).to.be.revertedWithCustomError(
                beneficiariesFacet,
                'AccountHasNoRole'
            )
        })

        it('GIVEN an listed beneficiary WHEN user removes it if token is paused THEN it reverts with TokenIsPaused', async () => {
            await pauseFacet.pause({ gasLimit: GAS_LIMIT.default })

            await expect(
                beneficiariesFacet.removeBeneficiary(BENEFICIARY_2, {
                    gasLimit: GAS_LIMIT.default,
                })
            ).to.be.revertedWithCustomError(beneficiariesFacet, 'TokenIsPaused')
        })

        it('GIVEN a unlisted beneficiary WHEN removing it again THEN it reverts with BeneficiaryNotFound', async () => {
            await expect(
                beneficiariesFacet.removeBeneficiary(BENEFICIARY_1, {
                    gasLimit: GAS_LIMIT.default,
                })
            ).to.be.revertedWithCustomError(
                beneficiariesFacet,
                'BeneficiaryNotFound'
            )
        })

        it('GIVEN a listed beneficiary WHEN authorized user removes it THEN it is removed and event is emitted', async () => {
            await expect(
                beneficiariesFacet.removeBeneficiary(BENEFICIARY_2, {
                    gasLimit: GAS_LIMIT.default,
                })
            )
                .to.emit(beneficiariesFacet, 'BeneficiaryRemoved')
                .withArgs(signer_A.address, BENEFICIARY_2)

            expect(await beneficiariesFacet.isBeneficiary(BENEFICIARY_2)).to.be
                .false

            expect(await beneficiariesFacet.getBeneficiariesCount()).to.equal(0)

            expect(
                await beneficiariesFacet.getBeneficiaries(0, 100)
            ).to.have.same.members([])
        })
    })

    describe('Update Data Tests', () => {
        it('GIVEN a listed beneficiary WHEN unauthorized user updates its data THEN it reverts with AccountHasNoRole', async () => {
            beneficiariesFacet = beneficiariesFacet.connect(signer_B)

            await expect(
                beneficiariesFacet.updateBeneficiaryData(
                    BENEFICIARY_2,
                    BENEFICIARY_1_DATA,
                    { gasLimit: GAS_LIMIT.default }
                )
            ).to.be.revertedWithCustomError(
                beneficiariesFacet,
                'AccountHasNoRole'
            )
        })

        it('GIVEN an listed beneficiary WHEN user updates its data if token is paused THEN it reverts with TokenIsPaused', async () => {
            await pauseFacet.pause({ gasLimit: GAS_LIMIT.default })

            await expect(
                beneficiariesFacet.updateBeneficiaryData(
                    BENEFICIARY_2,
                    BENEFICIARY_1_DATA,
                    { gasLimit: GAS_LIMIT.default }
                )
            ).to.be.revertedWithCustomError(beneficiariesFacet, 'TokenIsPaused')
        })

        it('GIVEN a unlisted beneficiary WHEN updating its data THEN it reverts with BeneficiaryNotFound', async () => {
            await expect(
                beneficiariesFacet.updateBeneficiaryData(
                    BENEFICIARY_1,
                    BENEFICIARY_1_DATA,
                    { gasLimit: GAS_LIMIT.default }
                )
            ).to.be.revertedWithCustomError(
                beneficiariesFacet,
                'BeneficiaryNotFound'
            )
        })

        it('GIVEN a listed beneficiary WHEN authorized user updates its data THEN it is updated and event is emitted', async () => {
            expect(
                await beneficiariesFacet.getBeneficiaryData(BENEFICIARY_2)
            ).to.equal(BENEFICIARY_2_DATA)

            await expect(
                beneficiariesFacet.updateBeneficiaryData(
                    BENEFICIARY_2,
                    BENEFICIARY_1_DATA,
                    { gasLimit: GAS_LIMIT.default }
                )
            )
                .to.emit(beneficiariesFacet, 'BeneficiaryDataUpdated')
                .withArgs(signer_A.address, BENEFICIARY_2, BENEFICIARY_1_DATA)

            expect(
                await beneficiariesFacet.getBeneficiaryData(BENEFICIARY_2)
            ).to.equal(BENEFICIARY_1_DATA)
        })
    })
})
