import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers.js'
import { isinGenerator } from '@thomaschaplin/isin-generator'
import {
    BusinessLogicResolver,
    ProceedRecipients,
    ProceedRecipients__factory,
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
    PROCEED_RECIPIENT_MANAGER_ROLE,
    RegulationSubType,
    RegulationType,
    PAUSER_ROLE,
} from '@scripts'

const PROCEED_RECIPIENT_1 = '0x1234567890123456789012345678901234567890'
const PROCEED_RECIPIENT_1_DATA = '0xabcdef'
const PROCEED_RECIPIENT_2 = '0x2345678901234567890123456789012345678901'
const PROCEED_RECIPIENT_2_DATA = '0x88888888'
const numberOfUnits = 1000
let startingDate = 999999999999990
let maturityDate = 999999999999999
const countriesControlListType = true
const listOfCountries = 'ES,FR,CH'
const info = 'info'

describe('Proceed Recipients Tests', () => {
    let signer_A: SignerWithAddress
    let signer_B: SignerWithAddress
    let account_A: string

    let diamond: ResolverProxy
    let factory: IFactory
    let businessLogicResolver: BusinessLogicResolver
    let proceedRecipientsFacet: ProceedRecipients
    let accessControlFacet: AccessControl
    let pauseFacet: Pause

    before(async () => {
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
            name: 'TEST_ProceedRecipients',
            symbol: 'TB',
            decimals: 6,
            isin: isinGenerator(),
            currency: '0x455552',
            numberOfUnits,
            nominalValue: 100,
            startingDate,
            maturityDate,
            regulationType: RegulationType.REG_D,
            regulationSubType: RegulationSubType.REG_D_506_C,
            countriesControlListType,
            listOfCountries,
            info,
            factory,
            businessLogicResolver: businessLogicResolver.address,
            proceedRecipientsList: [PROCEED_RECIPIENT_2],
            proceedRecipientsListData: [PROCEED_RECIPIENT_2_DATA],
        })

        proceedRecipientsFacet = ProceedRecipients__factory.connect(
            diamond.address,
            signer_A
        )

        accessControlFacet = AccessControlFacet__factory.connect(
            diamond.address,
            signer_A
        )

        pauseFacet = PauseFacet__factory.connect(diamond.address, signer_A)

        await accessControlFacet.grantRole(
            PROCEED_RECIPIENT_MANAGER_ROLE,
            account_A
        )

        await accessControlFacet.grantRole(PAUSER_ROLE, account_A)
    })

    describe('Initialization Tests', () => {
        it('GIVEN a token WHEN initializing the proceed recipient again THEN it reverts with AlreadyInitialized', async () => {
            await expect(
                proceedRecipientsFacet.initialize_ProceedRecipients(
                    [PROCEED_RECIPIENT_1],
                    [PROCEED_RECIPIENT_1_DATA],
                    { gasLimit: GAS_LIMIT.default }
                )
            ).to.be.revertedWithCustomError(
                proceedRecipientsFacet,
                'AlreadyInitialized'
            )
        })
    })

    describe('Add Tests', () => {
        it('GIVEN an unlisted proceed recipient WHEN unauthorized user adds it THEN it reverts with AccountHasNoRole', async () => {
            await expect(
                proceedRecipientsFacet
                    .connect(signer_B)
                    .addProceedRecipient(
                        PROCEED_RECIPIENT_1,
                        PROCEED_RECIPIENT_1_DATA,
                        {
                            gasLimit: GAS_LIMIT.default,
                        }
                    )
            ).to.be.revertedWithCustomError(
                proceedRecipientsFacet,
                'AccountHasNoRole'
            )
        })

        it('GIVEN an unlisted proceed recipient WHEN user adds if token is paused THEN it reverts with TokenIsPaused', async () => {
            await pauseFacet.pause({ gasLimit: GAS_LIMIT.default })

            await expect(
                proceedRecipientsFacet.addProceedRecipient(
                    PROCEED_RECIPIENT_1,
                    PROCEED_RECIPIENT_1_DATA,
                    { gasLimit: GAS_LIMIT.default }
                )
            ).to.be.revertedWithCustomError(
                proceedRecipientsFacet,
                'TokenIsPaused'
            )
        })

        it('GIVEN a listed proceed recipient WHEN adding it again THEN it reverts with ProceedRecipientAlreadyExists', async () => {
            await expect(
                proceedRecipientsFacet.addProceedRecipient(
                    PROCEED_RECIPIENT_2,
                    PROCEED_RECIPIENT_1_DATA,
                    { gasLimit: GAS_LIMIT.default }
                )
            ).to.be.revertedWithCustomError(
                proceedRecipientsFacet,
                'ProceedRecipientAlreadyExists'
            )
        })

        it('GIVEN a unlisted proceed recipient WHEN authorized user adds it THEN it is listed and event is emitted', async () => {
            await expect(
                proceedRecipientsFacet.addProceedRecipient(
                    PROCEED_RECIPIENT_1,
                    PROCEED_RECIPIENT_1_DATA,
                    { gasLimit: GAS_LIMIT.default }
                )
            )
                .to.emit(proceedRecipientsFacet, 'ProceedRecipientAdded')
                .withArgs(
                    signer_A.address,
                    PROCEED_RECIPIENT_1,
                    PROCEED_RECIPIENT_1_DATA
                )

            expect(
                await proceedRecipientsFacet.isProceedRecipient(
                    PROCEED_RECIPIENT_1
                )
            ).to.be.true

            expect(
                await proceedRecipientsFacet.getProceedRecipientData(
                    PROCEED_RECIPIENT_1
                )
            ).to.equal(PROCEED_RECIPIENT_1_DATA)

            expect(
                await proceedRecipientsFacet.getProceedRecipientsCount()
            ).to.equal(2)

            expect(
                await proceedRecipientsFacet.getProceedRecipients(0, 100)
            ).to.have.same.members([PROCEED_RECIPIENT_2, PROCEED_RECIPIENT_1])
        })
    })

    describe('Remove Tests', () => {
        it('GIVEN a listed proceed recipient WHEN unauthorized user removes it THEN it reverts with AccountHasNoRole', async () => {
            await expect(
                proceedRecipientsFacet
                    .connect(signer_B)
                    .removeProceedRecipient(PROCEED_RECIPIENT_2, {
                        gasLimit: GAS_LIMIT.default,
                    })
            ).to.be.revertedWithCustomError(
                proceedRecipientsFacet,
                'AccountHasNoRole'
            )
        })

        it('GIVEN an listed proceed recipient WHEN user removes it if token is paused THEN it reverts with TokenIsPaused', async () => {
            await pauseFacet.pause({ gasLimit: GAS_LIMIT.default })
            await expect(
                proceedRecipientsFacet.removeProceedRecipient(
                    PROCEED_RECIPIENT_2,
                    {
                        gasLimit: GAS_LIMIT.default,
                    }
                )
            ).to.be.revertedWithCustomError(
                proceedRecipientsFacet,
                'TokenIsPaused'
            )
        })

        it('GIVEN a unlisted proceed recipient WHEN removing it again THEN it reverts with ProceedRecipientNotFound', async () => {
            await expect(
                proceedRecipientsFacet.removeProceedRecipient(
                    PROCEED_RECIPIENT_1,
                    {
                        gasLimit: GAS_LIMIT.default,
                    }
                )
            ).to.be.revertedWithCustomError(
                proceedRecipientsFacet,
                'ProceedRecipientNotFound'
            )
        })

        it('GIVEN a listed proceed recipient WHEN authorized user removes it THEN it is removed and event is emitted', async () => {
            await expect(
                proceedRecipientsFacet.removeProceedRecipient(
                    PROCEED_RECIPIENT_2,
                    {
                        gasLimit: GAS_LIMIT.default,
                    }
                )
            )
                .to.emit(proceedRecipientsFacet, 'ProceedRecipientRemoved')
                .withArgs(signer_A.address, PROCEED_RECIPIENT_2)

            expect(
                await proceedRecipientsFacet.isProceedRecipient(
                    PROCEED_RECIPIENT_2
                )
            ).to.be.false

            expect(
                await proceedRecipientsFacet.getProceedRecipientsCount()
            ).to.equal(0)

            expect(
                await proceedRecipientsFacet.getProceedRecipients(0, 100)
            ).to.have.same.members([])
        })
    })

    describe('Update Data Tests', () => {
        it('GIVEN a listed proceed recipient WHEN unauthorized user updates its data THEN it reverts with AccountHasNoRole', async () => {
            await expect(
                proceedRecipientsFacet
                    .connect(signer_B)
                    .updateProceedRecipientData(
                        PROCEED_RECIPIENT_2,
                        PROCEED_RECIPIENT_1_DATA,
                        {
                            gasLimit: GAS_LIMIT.default,
                        }
                    )
            ).to.be.revertedWithCustomError(
                proceedRecipientsFacet,
                'AccountHasNoRole'
            )
        })

        it('GIVEN an listed proceed recipient WHEN user updates its data if token is paused THEN it reverts with TokenIsPaused', async () => {
            await pauseFacet.pause({ gasLimit: GAS_LIMIT.default })
            await expect(
                proceedRecipientsFacet.updateProceedRecipientData(
                    PROCEED_RECIPIENT_2,
                    PROCEED_RECIPIENT_1_DATA,
                    { gasLimit: GAS_LIMIT.default }
                )
            ).to.be.revertedWithCustomError(
                proceedRecipientsFacet,
                'TokenIsPaused'
            )
        })

        it('GIVEN a unlisted proceed recipient WHEN updating its data THEN it reverts with ProceedRecipientNotFound', async () => {
            await expect(
                proceedRecipientsFacet.updateProceedRecipientData(
                    PROCEED_RECIPIENT_1,
                    PROCEED_RECIPIENT_1_DATA,
                    { gasLimit: GAS_LIMIT.default }
                )
            ).to.be.revertedWithCustomError(
                proceedRecipientsFacet,
                'ProceedRecipientNotFound'
            )
        })

        it('GIVEN a listed proceed recipient WHEN authorized user updates its data THEN it is updated and event is emitted', async () => {
            expect(
                await proceedRecipientsFacet.getProceedRecipientData(
                    PROCEED_RECIPIENT_2
                )
            ).to.equal(PROCEED_RECIPIENT_2_DATA)

            await expect(
                proceedRecipientsFacet.updateProceedRecipientData(
                    PROCEED_RECIPIENT_2,
                    PROCEED_RECIPIENT_1_DATA,
                    { gasLimit: GAS_LIMIT.default }
                )
            )
                .to.emit(proceedRecipientsFacet, 'ProceedRecipientDataUpdated')
                .withArgs(
                    signer_A.address,
                    PROCEED_RECIPIENT_2,
                    PROCEED_RECIPIENT_1_DATA
                )

            expect(
                await proceedRecipientsFacet.getProceedRecipientData(
                    PROCEED_RECIPIENT_2
                )
            ).to.equal(PROCEED_RECIPIENT_1_DATA)
        })
    })
})
