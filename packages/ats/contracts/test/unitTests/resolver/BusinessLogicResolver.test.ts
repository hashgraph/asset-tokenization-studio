import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { ethers } from 'hardhat'
import { expect } from 'chai'
import { AccessControl, Pause, BusinessLogicResolver } from '@typechain'
import { EQUITY_CONFIG_ID, ATS_ROLES } from '@scripts'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers.js'

describe('BusinessLogicResolver', () => {
    let signer_A: SignerWithAddress
    let signer_B: SignerWithAddress
    let signer_C: SignerWithAddress

    let businessLogicResolver: BusinessLogicResolver
    let accessControl: AccessControl
    let pause: Pause

    enum VersionStatus {
        NONE = 0,
        ACTIVATED = 1,
        DEACTIVATED = 2,
    }

    const BUSINESS_LOGIC_KEYS = [
        {
            businessLogicKey:
                '0xc09e617fd889212115dfeb9cc200796d756bdf992e7402dfa183ec179329e774',
            businessLogicAddress: '0x7773334dc2Db6F14aAF0C1D17c1B3F1769Cf31b9',
        },
        {
            businessLogicKey:
                '0x67cad3aaf0e0886c201f150fada758afb90ba6fb1d000459d64ea7625c4d31a5',
            businessLogicAddress: '0x7e6bf6542E1471206E0209330f091755ce5da81c',
        },
        {
            businessLogicKey:
                '0x474674736567e4f596b05ac260f4b8fe268139ecc92dcf67e0248e729235be5e',
            businessLogicAddress: '0x50CA271780151A9Da8895d7629f932A3f8897EFc',
        },
        {
            businessLogicKey:
                '0x2a271dec87b7552f37d532385985700dca633511feb45860d02d80937f63f1b9',
            businessLogicAddress: '0xE6F13EF90Acfa7CCad117328C1828449e7f5fe2B',
        },
    ]

    async function deployBusinessLogicResolverFixture() {
        ;[signer_A, signer_B, signer_C] = await ethers.getSigners()
        businessLogicResolver = await (
            await ethers.getContractFactory('BusinessLogicResolver', signer_A)
        ).deploy()

        await businessLogicResolver.initialize_BusinessLogicResolver()
        accessControl = await ethers.getContractAt(
            'AccessControl',
            businessLogicResolver.address,
            signer_A
        )
        await accessControl.grantRole(ATS_ROLES._PAUSER_ROLE, signer_B.address)

        pause = await ethers.getContractAt(
            'Pause',
            businessLogicResolver.address
        )
    }

    beforeEach(async () => {
        await loadFixture(deployBusinessLogicResolverFixture)
    })

    it('GIVEN an initialized contract WHEN trying to initialize it again THEN transaction fails with AlreadyInitialized', async () => {
        await expect(
            businessLogicResolver.initialize_BusinessLogicResolver()
        ).to.be.rejectedWith('AlreadyInitialized')
    })

    describe('Paused', () => {
        beforeEach(async () => {
            // Pausing the token
            await pause.connect(signer_B).pause()
        })

        it('GIVEN a paused Token WHEN registrying logics THEN transaction fails with TokenIsPaused', async () => {
            // transfer with data fails
            await expect(
                businessLogicResolver.registerBusinessLogics(
                    BUSINESS_LOGIC_KEYS.slice(0, 2)
                )
            ).to.be.rejectedWith('TokenIsPaused')
        })
    })

    describe('AccessControl', () => {
        it('GIVEN an account without admin role WHEN registrying logics THEN transaction fails with AccountHasNoRole', async () => {
            // add to list fails
            await expect(
                businessLogicResolver
                    .connect(signer_C)
                    .registerBusinessLogics(BUSINESS_LOGIC_KEYS.slice(0, 2))
            ).to.be.rejectedWith('AccountHasNoRole')
        })
    })

    describe('Business Logic Resolver functionality', () => {
        it('GIVEN an empty registry WHEN getting data THEN responds empty values or BusinessLogicVersionDoesNotExist', async () => {
            expect(await businessLogicResolver.getLatestVersion()).is.equal(0)
            await expect(
                businessLogicResolver.getVersionStatus(0)
            ).to.be.rejectedWith('BusinessLogicVersionDoesNotExist')
            expect(
                await businessLogicResolver.resolveLatestBusinessLogic(
                    BUSINESS_LOGIC_KEYS[0].businessLogicKey
                )
            ).is.equal(ethers.constants.AddressZero)
            await expect(
                businessLogicResolver.resolveBusinessLogicByVersion(
                    BUSINESS_LOGIC_KEYS[0].businessLogicKey,
                    0
                )
            ).to.be.rejectedWith('BusinessLogicVersionDoesNotExist')
            await expect(
                businessLogicResolver.resolveBusinessLogicByVersion(
                    BUSINESS_LOGIC_KEYS[0].businessLogicKey,
                    1
                )
            ).to.be.rejectedWith('BusinessLogicVersionDoesNotExist')
            expect(
                await businessLogicResolver.getBusinessLogicCount()
            ).is.equal(0)
            expect(
                await businessLogicResolver.getBusinessLogicKeys(1, 10)
            ).is.deep.equal([])
        })

        it('GIVEN an empty key WHEN registerBusinessLogics THEN Fails with ZeroKeyNotValidForBusinessLogic', async () => {
            const BUSINESS_LOGICS_TO_REGISTER = [
                {
                    businessLogicKey: ethers.constants.HashZero,
                    businessLogicAddress:
                        '0x7773334dc2Db6F14aAF0C1D17c1B3F1769Cf31b9',
                },
            ]

            await expect(
                businessLogicResolver.registerBusinessLogics(
                    BUSINESS_LOGICS_TO_REGISTER
                )
            ).to.be.rejectedWith('ZeroKeyNotValidForBusinessLogic')
        })

        it('GIVEN an duplicated key WHEN registerBusinessLogics THEN Fails with BusinessLogicKeyDuplicated', async () => {
            const BUSINESS_LOGICS_TO_REGISTER = [
                BUSINESS_LOGIC_KEYS[0],
                BUSINESS_LOGIC_KEYS[0],
            ]

            await expect(
                businessLogicResolver.registerBusinessLogics(
                    BUSINESS_LOGICS_TO_REGISTER
                )
            ).to.be.rejectedWith('BusinessLogicKeyDuplicated')
        })

        it('GIVEN a list of logics WHEN registerBusinessLogics THEN Fails if some key is not informed with AllBusinessLogicKeysMustBeenInformed', async () => {
            await businessLogicResolver.registerBusinessLogics([
                BUSINESS_LOGIC_KEYS[0],
            ])

            await expect(
                businessLogicResolver.registerBusinessLogics([
                    BUSINESS_LOGIC_KEYS[1],
                ])
            ).to.be.rejectedWith('AllBusinessLogicKeysMustBeenInformed')
        })

        it('GIVEN an empty registry WHEN registerBusinessLogics THEN queries responds with correct values', async () => {
            const LATEST_VERSION = 1
            const BUSINESS_LOGICS_TO_REGISTER = BUSINESS_LOGIC_KEYS.slice(0, 2)
            expect(
                await businessLogicResolver.registerBusinessLogics(
                    BUSINESS_LOGICS_TO_REGISTER
                )
            )
                .to.emit(businessLogicResolver, 'BusinessLogicsRegistered')
                .withArgs(BUSINESS_LOGICS_TO_REGISTER, LATEST_VERSION)

            expect(await businessLogicResolver.getLatestVersion()).is.equal(
                LATEST_VERSION
            )
            expect(
                await businessLogicResolver.getVersionStatus(LATEST_VERSION)
            ).to.be.equal(VersionStatus.ACTIVATED)
            expect(
                await businessLogicResolver.resolveLatestBusinessLogic(
                    BUSINESS_LOGIC_KEYS[0].businessLogicKey
                )
            ).is.equal(BUSINESS_LOGIC_KEYS[0].businessLogicAddress)
            expect(
                await businessLogicResolver.resolveLatestBusinessLogic(
                    BUSINESS_LOGIC_KEYS[1].businessLogicKey
                )
            ).is.equal(BUSINESS_LOGIC_KEYS[1].businessLogicAddress)
            expect(
                await businessLogicResolver.resolveBusinessLogicByVersion(
                    BUSINESS_LOGIC_KEYS[0].businessLogicKey,
                    LATEST_VERSION
                )
            ).to.be.equal(BUSINESS_LOGIC_KEYS[0].businessLogicAddress)
            expect(
                await businessLogicResolver.resolveBusinessLogicByVersion(
                    BUSINESS_LOGIC_KEYS[1].businessLogicKey,
                    LATEST_VERSION
                )
            ).to.be.equal(BUSINESS_LOGIC_KEYS[1].businessLogicAddress)
            expect(
                await businessLogicResolver.getBusinessLogicCount()
            ).is.equal(BUSINESS_LOGICS_TO_REGISTER.length)
            expect(
                await businessLogicResolver.getBusinessLogicKeys(0, 10)
            ).is.deep.equal(
                BUSINESS_LOGICS_TO_REGISTER.map(
                    (businessLogic) => businessLogic.businessLogicKey
                )
            )
        })

        it('GIVEN an registry with 1 version WHEN registerBusinessLogics with different keys THEN queries responds with correct values', async () => {
            await businessLogicResolver.registerBusinessLogics(
                BUSINESS_LOGIC_KEYS.slice(0, 2)
            )

            const LATEST_VERSION = 2
            const BUSINESS_LOGICS_TO_REGISTER = BUSINESS_LOGIC_KEYS.slice(0, 3)
            expect(
                await businessLogicResolver.registerBusinessLogics(
                    BUSINESS_LOGICS_TO_REGISTER
                )
            )
                .to.emit(businessLogicResolver, 'BusinessLogicsRegistered')
                .withArgs(BUSINESS_LOGICS_TO_REGISTER, LATEST_VERSION)

            expect(await businessLogicResolver.getLatestVersion()).is.equal(
                LATEST_VERSION
            )
            expect(
                await businessLogicResolver.getVersionStatus(LATEST_VERSION)
            ).to.be.equal(VersionStatus.ACTIVATED)
            expect(
                await businessLogicResolver.resolveLatestBusinessLogic(
                    BUSINESS_LOGIC_KEYS[0].businessLogicKey
                )
            ).is.equal(BUSINESS_LOGIC_KEYS[0].businessLogicAddress)
            expect(
                await businessLogicResolver.resolveLatestBusinessLogic(
                    BUSINESS_LOGIC_KEYS[1].businessLogicKey
                )
            ).is.equal(BUSINESS_LOGIC_KEYS[1].businessLogicAddress)
            expect(
                await businessLogicResolver.resolveLatestBusinessLogic(
                    BUSINESS_LOGIC_KEYS[2].businessLogicKey
                )
            ).is.equal(BUSINESS_LOGIC_KEYS[2].businessLogicAddress)
            expect(
                await businessLogicResolver.resolveBusinessLogicByVersion(
                    BUSINESS_LOGIC_KEYS[0].businessLogicKey,
                    LATEST_VERSION
                )
            ).to.be.equal(BUSINESS_LOGIC_KEYS[0].businessLogicAddress)
            expect(
                await businessLogicResolver.resolveBusinessLogicByVersion(
                    BUSINESS_LOGIC_KEYS[1].businessLogicKey,
                    LATEST_VERSION
                )
            ).to.be.equal(BUSINESS_LOGIC_KEYS[1].businessLogicAddress)
            expect(
                await businessLogicResolver.resolveBusinessLogicByVersion(
                    BUSINESS_LOGIC_KEYS[2].businessLogicKey,
                    LATEST_VERSION
                )
            ).to.be.equal(BUSINESS_LOGIC_KEYS[2].businessLogicAddress)
            expect(
                await businessLogicResolver.getBusinessLogicCount()
            ).is.equal(BUSINESS_LOGICS_TO_REGISTER.length)
            expect(
                await businessLogicResolver.getBusinessLogicKeys(0, 10)
            ).is.deep.equal(
                BUSINESS_LOGICS_TO_REGISTER.map(
                    (businessLogic) => businessLogic.businessLogicKey
                )
            )
        })

        it('GIVEN a configuration add a selector to the blacklist THEN queries respond with correct values', async () => {
            const blackListedSelectors = ['0x8456cb59'] // pause() selector

            await businessLogicResolver.addSelectorsToBlacklist(
                EQUITY_CONFIG_ID,
                blackListedSelectors
            )

            expect(
                await businessLogicResolver.getSelectorsBlacklist(
                    EQUITY_CONFIG_ID,
                    0,
                    100
                )
            ).to.deep.equal(blackListedSelectors)

            await businessLogicResolver.removeSelectorsFromBlacklist(
                EQUITY_CONFIG_ID,
                blackListedSelectors
            )
            expect(
                await businessLogicResolver.getSelectorsBlacklist(
                    EQUITY_CONFIG_ID,
                    0,
                    100
                )
            ).to.deep.equal([])
        })
    })
})
